type Props = {
  params: { id: string };
};

const Page = async ({ params }: Props) => {
  const id = (await params).id;

  return (
    <>
      <h4>{id}</h4>
    </>
  );
};

export default Page;
