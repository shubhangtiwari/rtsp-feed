export type Camera = {
  name: string,
  id: string,
  mainStream: string,
  subStream: string,
  filePrefix: string
};

export type ProxyObject = {
  [key: string]: any
};