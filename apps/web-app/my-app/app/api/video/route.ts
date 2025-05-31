import { NextResponse } from "next/server";
import { Video } from "@/app/db/model";

export const GET = async () => {
  const data = await Video.find();
  return NextResponse.json({ data: data });
};