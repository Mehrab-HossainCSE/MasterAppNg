export class Response {
    DataCount: number;
    Count: number;
    DataList: [];
    Data: [];
    HasError: boolean;
    Succeeded: boolean;

    Messages: [];
  
    constructor() {
      this.DataCount = 0;
      this.Count = 0;
      this.DataList = [];
      this.HasError = false;
      this.Succeeded = true;
      this.Messages = [];
      this.Data = [];
    }
  }