import { ConflictException } from '@nestjs/common';
import { SeatAllocator } from './seat-allocator.js';

describe('SeatAllocator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-08T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('holds a seat when capacity is available', async () => {
    const tx = {
      workshop: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'workshop-1',
          capacity: 2,
          registeredCount: 1,
          price: 100,
          status: 'published',
        }),
      },
      registration: {
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 'registration-1' }),
        update: jest.fn(),
      },
    };

    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const allocator = new SeatAllocator(prisma as never);
    const result = await allocator.holdSeat('mssv-1', 'workshop-1');

    expect(result).toEqual({ id: 'registration-1' });
    expect(tx.registration.create).toHaveBeenCalled();
  });

  it('throws when capacity is full on hold', async () => {
    const tx = {
      workshop: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'workshop-1',
          capacity: 1,
          registeredCount: 1,
          price: 100,
          status: 'published',
        }),
      },
      registration: {
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const allocator = new SeatAllocator(prisma as never);

    await expect(
      allocator.holdSeat('mssv-1', 'workshop-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('reuses an active hold for the same student and workshop', async () => {
    const existingHold = {
      id: 'registration-3',
      status: 'pending',
      heldUntil: new Date('2026-05-08T00:10:00Z'),
    };
    const tx = {
      workshop: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'workshop-1',
          capacity: 2,
          registeredCount: 1,
          price: 100,
          status: 'published',
        }),
      },
      registration: {
        findUnique: jest.fn().mockResolvedValue(existingHold),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const allocator = new SeatAllocator(prisma as never);
    const result = await allocator.holdSeat('mssv-1', 'workshop-1');

    expect(result).toBe(existingHold);
    expect(tx.registration.count).not.toHaveBeenCalled();
    expect(tx.registration.update).not.toHaveBeenCalled();
  });

  it('revives an expired hold for the same student and workshop', async () => {
    const existingHold = {
      id: 'registration-4',
      status: 'expired',
      heldUntil: new Date('2026-05-07T23:59:00Z'),
    };
    const revivedHold = {
      id: 'registration-4',
      status: 'pending',
    };
    const tx = {
      workshop: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'workshop-1',
          capacity: 2,
          registeredCount: 1,
          price: 100,
          status: 'published',
        }),
      },
      registration: {
        findUnique: jest.fn().mockResolvedValue(existingHold),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(revivedHold),
      },
    };

    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const allocator = new SeatAllocator(prisma as never);
    const result = await allocator.holdSeat('mssv-1', 'workshop-1');
    const updateCalls = tx.registration.update.mock.calls as Array<
      [
        {
          where: { id: string };
          data: {
            status: string;
            paymentStatus: string;
            heldUntil: Date;
            paymentCompletedAt: null;
            cancellationReason: null;
            qrCode: null;
          };
        },
      ]
    >;
    const updateArgs = updateCalls[0]?.[0];

    expect(result).toEqual(revivedHold);
    expect(tx.registration.create).not.toHaveBeenCalled();
    expect(updateArgs?.where).toEqual({ id: 'registration-4' });
    expect(updateArgs?.data.status).toBe('pending');
    expect(updateArgs?.data.paymentStatus).toBe('pending');
    expect(updateArgs?.data.heldUntil).toBeInstanceOf(Date);
    expect(updateArgs?.data.paymentCompletedAt).toBeNull();
    expect(updateArgs?.data.cancellationReason).toBeNull();
    expect(updateArgs?.data.qrCode).toBeNull();
  });

  it('confirms free registration when capacity is available', async () => {
    const tx = {
      workshop: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'workshop-1',
          capacity: 2,
          registeredCount: 1,
          status: 'published',
        }),
        update: jest.fn().mockResolvedValue({ id: 'workshop-1' }),
      },
      registration: {
        create: jest.fn().mockResolvedValue({ id: 'registration-2' }),
      },
    };

    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const allocator = new SeatAllocator(prisma as never);
    const result = await allocator.confirmFreeRegistration(
      'mssv-1',
      'workshop-1',
    );

    expect(result).toEqual({ id: 'registration-2' });
    expect(tx.workshop.update).toHaveBeenCalled();
  });

  it('throws when capacity is full on free confirm', async () => {
    const tx = {
      workshop: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'workshop-1',
          capacity: 1,
          registeredCount: 1,
          status: 'published',
        }),
        update: jest.fn(),
      },
      registration: {
        create: jest.fn(),
      },
    };

    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const allocator = new SeatAllocator(prisma as never);

    await expect(
      allocator.confirmFreeRegistration('mssv-1', 'workshop-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
