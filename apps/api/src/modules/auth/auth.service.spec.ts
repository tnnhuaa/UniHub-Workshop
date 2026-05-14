import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  type TransactionClientMock = {
    student: {
      update: jest.Mock;
    };
    userRole: {
      upsert: jest.Mock;
    };
  };

  const buildPrisma = () => ({
    betterAuthUser: {
      findUnique: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    userRole: {
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  });

  it('auto-links a matching student email and grants student role when session is loaded', async () => {
    const prisma = buildPrisma();
    prisma.betterAuthUser.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'student@university.edu',
    });
    prisma.student.findFirst.mockResolvedValue({
      mssv: '2212345',
      betterAuthUserId: null,
    });
    prisma.$transaction.mockImplementation(
      (callback: (tx: TransactionClientMock) => Promise<unknown>) =>
        callback({
          student: {
            update: prisma.student.update,
          },
          userRole: {
            upsert: prisma.userRole.upsert,
          },
        }),
    );

    const auth = {
      api: {
        getSession: jest.fn().mockResolvedValue({
          user: { id: 'user-1' },
          session: { id: 'session-1' },
        }),
      },
    };

    const service = new AuthService(prisma as never, auth as never);

    const result = await service.getSessionFromRequest({
      headers: {},
    } as never);

    expect(result?.user.id).toBe('user-1');
    expect(prisma.student.update).toHaveBeenCalledWith({
      where: { mssv: '2212345' },
      data: { betterAuthUserId: 'user-1' },
    });
    expect(prisma.userRole.upsert).toHaveBeenCalledWith({
      where: {
        userId_role: {
          userId: 'user-1',
          role: 'student',
        },
      },
      update: {},
      create: {
        userId: 'user-1',
        role: 'student',
      },
    });
  });

  it('does not assign student access when no student record matches the email', async () => {
    const prisma = buildPrisma();
    prisma.betterAuthUser.findUnique.mockResolvedValue({
      id: 'user-2',
      email: 'outsider@example.com',
    });
    prisma.student.findFirst.mockResolvedValue(null);

    const auth = {
      api: {
        getSession: jest.fn().mockResolvedValue({
          user: { id: 'user-2' },
          session: { id: 'session-2' },
        }),
      },
    };

    const service = new AuthService(prisma as never, auth as never);

    await service.getSessionFromRequest({
      headers: {},
    } as never);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.student.update).not.toHaveBeenCalled();
    expect(prisma.userRole.upsert).not.toHaveBeenCalled();
  });
});
