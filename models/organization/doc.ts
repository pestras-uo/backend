import { Doc } from "../core";

export class Organization extends Doc {
  
  constructor(public name: string, public tags: string[] = []) {
    super();
  }
}