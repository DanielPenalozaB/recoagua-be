import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { passwordResetEmail } from './templates/password-reset.template';
import { emailConfirmation } from './templates/email-confirmation.template';
import { passwordSetEmail } from './templates/password-set.template';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly resendEmailFrom: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    this.resendEmailFrom = this.configService.get('RESEND_EMAIL_FROM') ?? '';
  }

  async sendPasswordResetEmail(name: string, email: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get('FRONTEND_URL')}/auth/set-password/${token}`;
    const { subject, html, text } = passwordResetEmail(name, resetLink);

    try {
      await this.resend.emails.send({
        from: this.resendEmailFrom,
        to: email,
        subject: subject,
        html: html,
        text: text
      });
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordSetupEmail(name: string, email: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get('FRONTEND_URL')}/auth/set-password/${token}`;
    const { subject, html, text } = passwordSetEmail(name, resetLink);

    try {
      await this.resend.emails.send({
        from: this.resendEmailFrom,
        to: email,
        subject: subject,
        html: html,
        text: text
      });
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendEmailConfirmation(name: string, email: string, token: string): Promise<void> {
    const confirmLink = `${this.configService.get('FRONTEND_URL')}/auth/confirm-email/${token}`;

    const { subject, html, text } = emailConfirmation(name, confirmLink);

    try {
      await this.resend.emails.send({
        from: this.resendEmailFrom,
        to: email,
        subject: subject,
        html: html,
        text: text
      });
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      throw new Error('Failed to send email');
    }
  }
}
