import type { NextApiRequest } from "next";

import { HttpError } from "@calcom/lib/http-error";

import { schemaQueryIdAsString } from "~/lib/validations/shared/queryIdString";

async function authMiddleware(req: NextApiRequest) {
  const { userId, prisma, isAdmin, query } = req;
  const { id } = schemaQueryIdAsString.parse(query);
  const userWithBookings = await prisma.user.findUnique({
    where: { id: userId },
    include: { bookings: true },
  });

  if (!userWithBookings) throw new HttpError({ statusCode: 404, message: "User not found" });

  const userBookingUids = userWithBookings.bookings.map((booking) => booking.uid);

  if (!isAdmin && !userBookingUids.includes(id)) {
    throw new HttpError({ statusCode: 401, message: "You are not authorized" });
  }
}

export default authMiddleware;
