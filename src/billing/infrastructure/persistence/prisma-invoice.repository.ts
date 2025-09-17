import { Injectable } from '@nestjs/common';
import { Invoice as PrismaInvoice } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Invoice } from '../../domain/entities/invoice.entity';
import {
  CreateInvoiceRecord,
  InvoiceRepository,
} from '../../domain/repositories/invoice.repository';

const mapToDomain = (record: PrismaInvoice | null): Invoice | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Invoice();
  entity.invoiceId = record.invoiceId;
  entity.subscriptionId = record.subscriptionId;
  entity.amount = record.amount;
  entity.status = record.status;
  entity.createdAt = record.createdAt;
  entity.pdfUrl = record.pdfUrl ?? undefined;
  return entity;
};

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInvoiceRecord): Promise<Invoice> {
    const record = await this.prisma.invoice.create({
      data: {
        invoiceId: data.invoiceId,
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        status: data.status,
        createdAt: data.createdAt ?? undefined,
        pdfUrl: data.pdfUrl,
      },
    });
    return mapToDomain(record)!;
  }

  async findById(invoiceId: string): Promise<Invoice | undefined> {
    const record = await this.prisma.invoice.findUnique({
      where: { invoiceId },
    });
    return mapToDomain(record);
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const record = await this.prisma.invoice.update({
      where: { invoiceId: invoice.invoiceId },
      data: {
        amount: invoice.amount,
        status: invoice.status,
        pdfUrl: invoice.pdfUrl ?? null,
      },
    });
    return mapToDomain(record)!;
  }
}
