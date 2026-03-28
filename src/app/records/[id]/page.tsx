interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecordDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <h1>Record: {id}</h1>
    </main>
  );
}
