export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    book?: PowerPartial<{
      a: number;
      b: string;
    }>;
  }
}
