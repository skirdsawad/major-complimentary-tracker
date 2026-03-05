import { GiveawayItemEditForm } from './giveaway-item-edit-form';

interface EditGiveawayItemPageProps {
  params: Promise<{ itemCode: string }>;
}

export default async function EditGiveawayItemPage({
  params,
}: EditGiveawayItemPageProps) {
  const { itemCode } = await params;

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <GiveawayItemEditForm itemCode={itemCode} />
    </div>
  );
}
