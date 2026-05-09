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
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 'registration-1' }),
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
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
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
