import type { JobHandler } from '../jobs.types.js';

export const emailNotificationHandler: JobHandler = async (payload) => {
  const { to, subject, template, variables } = payload;
  console.log(`Sending email to ${to}: ${subject}`);
  // TODO: Implement actual email sending logic
  // Uses emailService with the specified template
};
