import { CronJob } from 'cron';
import propertyModel from '@/models/property.model';
import commentModel from '@/models/comment.model';
import propertySelectionModel from '@/models/property-selection.models';

export class DeletePropertiesJob {
  public static async run() {
    const job = new CronJob('*/5 * * * *', async () => {
      const properties = await propertyModel
        .find({
          isDeleted: true,
          deletedAt: { $lte: new Date(new Date().setDate(new Date().getDate() - 14)) },
        })
        .select('id');

      const propertyIds = properties.map((property) => property.id);

      await commentModel.deleteMany({ propertyId: { $in: propertyIds } });
      await propertySelectionModel.deleteMany({ propertyId: { $in: propertyIds } });

      const result = await propertyModel.deleteMany({ id: { $in: propertyIds } });
      console.log(`Deleted ${result.deletedCount} properties`);
    });
    job.start();
  }
}
