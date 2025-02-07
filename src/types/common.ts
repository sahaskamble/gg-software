import { Document } from "mongoose";

export interface TimeStamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseDocument extends Document, TimeStamps {}
