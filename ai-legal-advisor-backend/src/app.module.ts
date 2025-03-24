import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
// import { CollectionsModule } from './collections/collections.module';
// import { DocumentsModule } from './documents/documents.module';
// import { RagModule } from './rag/rag.module';
// import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    // CollectionsModule,
    // DocumentsModule,
    // RagModule,
    // StorageModule,
  ],
})
export class AppModule {}
