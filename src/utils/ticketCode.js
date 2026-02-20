export const generateTicketCode = () =>
  Math.random().toString(36).substring(2, 12).toUpperCase();