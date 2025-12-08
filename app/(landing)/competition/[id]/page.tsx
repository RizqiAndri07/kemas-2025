import { Button } from "@/components/ui/button";
import { competitionData } from "@/data/competition";
import { Calendar, Landmark, ScrollText } from "lucide-react";
import Link from "next/link";

type Props = {
  params: { id: string };
};

const getDetailCompetition = async (id: string) => {
  // Simulate fetching data based on the id
  return competitionData.find((event) => event.id.toString() === id);
};

const Page = async ({ params }: Props) => {
  const id = (await params).id;
  const detailCompetition = await getDetailCompetition(id);
  return (
    <>
      <Link href="/competition">
        <Button variant="default" className="mb-5">
          Back to Competition
        </Button>
      </Link>
      <div className="flex flex-col justify-center items-center space-y-4">
        <h1>{detailCompetition?.logo}</h1>
        <h4 className="text-primary">{detailCompetition?.name}</h4>
        <p className="text-center body-lg">{detailCompetition?.description}</p>
        <div className="grid grid-cols-2 gap-4 border w-full">
          <div className="bg-background w-full flex items-center gap-4 px-10 py-7 rounded-2xl shadow-md border border-primary/40">
            <Calendar
              size={16}
              className="bg-primary/20 border-primary/40 border text-primary rounded-2xl p-2 size-14 "
            />
            <div className="">
              <h5 className="text-primary">Pendaftaran</h5>
              <p className="body text-foreground/70">
                {detailCompetition?.open_registration}
              </p>
            </div>
          </div>
          <div className="bg-background w-full flex items-center gap-4 px-10 py-7 rounded-2xl shadow-md border border-secondary/40">
            <Calendar
              size={16}
              className="bg-secondary/20 border-secondary/40 border text-secondary rounded-2xl p-2 size-14 "
            />
            <div className="">
              <h5 className="text-secondary">Pelaksanaan</h5>
              <p className="body text-foreground/70">
                {detailCompetition?.date}
              </p>
            </div>
          </div>
          <div className="bg-background w-full flex items-center gap-4 px-10 py-7 rounded-2xl shadow-md border border-accent/40">
            <Landmark
              size={16}
              className="bg-accent/20 border-accent/40 border text-accent rounded-2xl p-2 size-14 "
            />
            <div className="">
              <h5 className="text-accent">Harga</h5>
              <p className="body text-foreground/70">
                {`Rp ${detailCompetition?.prize.toLocaleString("id-ID")}`}
              </p>
            </div>
          </div>
          <div className="bg-background w-full flex items-center gap-4 px-10 py-7 rounded-2xl shadow-md border border-accent/40">
            <Landmark
              size={16}
              className="bg-accent/20 border-accent/40 border text-accent rounded-2xl p-2 size-14 "
            />
            <div className="">
              <h5 className="text-accent">Lokasi</h5>
              <p className="body text-foreground/70">
                {detailCompetition?.location}
              </p>
            </div>
          </div>
        </div>
        {detailCompetition?.rules && (
          <div className="w-full bg-background p-8 rounded-2xl shadow-md border border-foreground/10">
            <div className="flex text-secondary items-center gap-2 mb-4">
              <ScrollText
                size={32}
                className="bg-secondary/20 border-secondary/40 border text-secondary rounded-xl p-2 size-12 "
              />
              <h4 className="text-primary">Syarat dan Ketentuan</h4>
            </div>
            <ol className="list-decimal list-inside space-y-2">
              {detailCompetition.rules.map((rule, index) => (
                <li key={index} className="body text-foreground/70">
                  {rule}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
