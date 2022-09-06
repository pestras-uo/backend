import { ObjectId } from "mongodb";
import { Doc } from '../core';

export default class Document extends Doc {

  constructor(public path: string, public name: string, public groups: ObjectId[] = []) {
    super();
  }
}