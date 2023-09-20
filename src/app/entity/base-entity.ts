import { Guid } from "guid-typescript";

export class BaseEntity {
  public id: Guid = Guid.createEmpty();
  public createdOn: string = '';
}
