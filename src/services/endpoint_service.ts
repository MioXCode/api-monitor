import { Prisma, Endpoint } from "@prisma/client";
import { prisma } from "../config/database";
import { EndpointRequest } from "../types";

export class EndpointService {
  async create(userId: string, data: EndpointRequest): Promise<Endpoint> {
    try {
      await this.validateUniqueEndpoint(userId, data.url);
      return await prisma.endpoint.create({
        data: {
          ...data,
          userId,
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to create endpoint");
    }
  }

  async findAll(userId: string): Promise<Endpoint[]> {
    try {
      return await prisma.endpoint.findMany({
        where: { userId },
        include: {
          monitorLogs: {
            take: 10,
            orderBy: { timestamp: "desc" },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to fetch endpoints");
    }
  }

  async findOne(id: string, userId: string): Promise<Endpoint> {
    const endpoint = await prisma.endpoint.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        monitorLogs: {
          take: 100,
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!endpoint) {
      throw new Error("Endpoint not found");
    }

    return endpoint;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<EndpointRequest>
  ): Promise<Endpoint> {
    try {
      await this.findOne(id, userId);

      if (data.url) {
        await this.validateUniqueEndpoint(userId, data.url, id);
      }

      return await prisma.endpoint.update({
        where: { id, userId },
        data: {
          ...data,
          headers: data.headers ?? Prisma.JsonNull,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to update endpoint: ${error.message}`);
    }
  }

  async delete(id: string, userId: string): Promise<Endpoint> {
    try {
      await this.findOne(id, userId);

      return await prisma.endpoint.delete({
        where: { id, userId },
      });
    } catch (error: any) {
      throw new Error(`Failed to delete endpoint: ${error.message}`);
    }
  }

  private async validateUniqueEndpoint(
    userId: string,
    url: string,
    excludeId?: string
  ) {
    const existingEndpoint = await prisma.endpoint.findFirst({
      where: {
        url,
        userId,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });

    if (existingEndpoint) {
      throw new Error("Endpoint already exists");
    }
  }
}
