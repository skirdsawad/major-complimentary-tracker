import { CinemaBranchEditForm } from './cinema-branch-edit-form';

interface EditCinemaBranchPageProps {
  params: Promise<{ branchCode: string }>;
}

export default async function EditCinemaBranchPage({
  params,
}: EditCinemaBranchPageProps) {
  const { branchCode } = await params;

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <CinemaBranchEditForm branchCode={branchCode} />
    </div>
  );
}
