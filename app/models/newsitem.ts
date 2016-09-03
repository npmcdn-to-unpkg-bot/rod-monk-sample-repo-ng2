export class NewsItem {
  constructor(
    public _id: string = null,
    public headline: string = null,
    public body: string = null,
    public uploadTimestamp?: Date
  ) { }
}
