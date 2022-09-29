import { Request } from "express";
import { Category } from "../../models/core/categories/interface";

export type GetAllCategoriesRequest = Request<
  // params
  any,
  // response
  Category[]
>;

export type GetCategoryByIdRequest = Request<
  // params
  { id: string },
  // response
  Category
>;

export type CreateCategoryRequest = Request<
  // params
  any,
  // response
  Category,
  // body
  { name_ar: string; name_en: string; parent?: string; }
>;

export type updateCategoryRequest = Request<
// params
{ id: string },
// response
boolean,
// body
{ name_ar: string; name_en: string; }
>;