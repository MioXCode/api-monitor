import { prisma } from "../config/database";
import axios, { AxiosError } from "axios";
import { Endpoint, EndpointStatus, NotificationType } from "@prisma/client";
import { NotificationService } from "./notification_service";

export class MonitorService {
  private readonly notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async checkEndpoint(endpoint: Endpoint) {
    try {
      const startTime = Date.now();
      const monitorResult = await this.performHealthCheck(endpoint);
      const responseTime = Date.now() - startTime;

      const log = await this.createMonitorLog(endpoint.id, {
        success: monitorResult.success,
        statusCode: monitorResult.statusCode,
        responseTime,
        errorMessage: monitorResult.errorMessage,
        errorType: monitorResult.errorType ?? null,
      });

      const newStatus = this.determineEndpointStatus(
        monitorResult.success,
        responseTime,
        endpoint.timeout
      );
      
      const updatedEndpoint = await this.updateEndpointStatus(
        endpoint,
        newStatus,
        responseTime
      );

      if (newStatus !== endpoint.status) {
        await this.notifyStatusChange(endpoint, newStatus);
      }

      return {
        log,
        status: newStatus,
        endpoint: updatedEndpoint,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to check endpoint");
    }
  }

  private async performHealthCheck(endpoint: Endpoint) {
    try {
      const response = await axios.get(endpoint.url, {
        timeout: endpoint.timeout,
        headers: endpoint.headers as Record<string, string>,
      });

      return {
        success: response.status >= 200 && response.status < 300,
        statusCode: response.status,
        errorMessage: null,
        errorType: null,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        statusCode: axiosError.response?.status ?? null,
        errorMessage: axiosError.message,
        errorType: axiosError.code,
      };
    }
  }

  private async createMonitorLog(
    endpointId: string,
    data: {
      success: boolean;
      statusCode: number | null;
      responseTime: number;
      errorMessage: string | null;
      errorType: string | null;
    }
  ) {
    return prisma.monitorLog.create({
      data: {
        endpointId,
        ...data,
      },
    });
  }

  private determineEndpointStatus(
    success: boolean,
    responseTime: number,
    timeout: number
  ): EndpointStatus {
    if (!success) return EndpointStatus.DOWN;
    if (responseTime > timeout) return EndpointStatus.WARNING;
    return EndpointStatus.ACTIVE;
  }

  private async updateEndpointStatus(
    endpoint: Endpoint,
    status: EndpointStatus,
    responseTime: number
  ) {
    return prisma.endpoint.update({
      where: { id: endpoint.id },
      data: {
        status,
        lastChecked: new Date(),
        responseTime,
      },
    });
  }

  private async notifyStatusChange(
    endpoint: Endpoint,
    newStatus: EndpointStatus
  ) {
    await this.notificationService.create({
      userId: endpoint.userId,
      endpointId: endpoint.id,
      type: this.getNotificationType(newStatus),
      message: `Endpoint ${endpoint.name} is now ${newStatus.toLowerCase()}`,
    });
  }

  private getNotificationType(status: EndpointStatus): NotificationType {
    switch (status) {
      case EndpointStatus.DOWN:
        return NotificationType.DOWN;
      case EndpointStatus.WARNING:
        return NotificationType.SLOW_RESPONSE;
      default:
        return NotificationType.RECOVERED;
    }
  }
}
