import { Button } from "@/components/ui/button";
import { competitionData } from "@/data/competition";
import { ArrowLeft, Calendar, Landmark, ScrollText } from "lucide-react";
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
    <div className="space-y-10">
      <Link href="/competition">
        <Button variant="outlinesecondary" className="m-3 body-sm">
          <ArrowLeft size={16} />
          Back to Competition
        </Button>
      </Link>
      <div className="flex flex-col w-full px-5 container md:mx-auto justify-center items-center space-y-4 relative">
        <div className="bg-accent/50 blur-3xl absolute -top-3 -z-30 w-full h-40 overflow-x-clip"></div>
        <h1>{detailCompetition?.logo}</h1>
        <h4 className="text-primary">{detailCompetition?.name}</h4>
        <p className="text-center body-sm">{detailCompetition?.description}</p>
        <div className="grid md:grid-cols-2 gap-4  w-full">
          <div className="bg-background w-full flex items-center gap-4 px-5 py-3 md:px-10  md:py-7 rounded-2xl shadow-md border border-primary/40">
            <Calendar
              size={0}
              className="bg-primary/20 border-primary/40 border text-primary rounded-md p-2  size-10 md:size-14 "
            />
            <div className="">
              <h5 className="text-primary">Pendaftaran</h5>
              <p className="body-sm text-foreground/70">
                {detailCompetition?.open_registration}
              </p>
            </div>
          </div>
          <div className="bg-background w-full flex items-center gap-4 px-5 py-3 md:px-10  md:py-7 rounded-2xl shadow-md border border-secondary/40">
            <Calendar
              size={16}
              className="bg-secondary/20 border-secondary/40 border text-secondary rounded-md p-2 md:size-14 size-10 "
            />
            <div className="">
              <h5 className="text-secondary">Pelaksanaan</h5>
              <p className="body-sm text-foreground/70">
                {detailCompetition?.date}
              </p>
            </div>
          </div>
          <div className="bg-background w-full flex items-center gap-4 px-5 py-3 md:px-10  md:py-7 rounded-2xl shadow-md border border-accent/40">
            <Landmark
              size={16}
              className="bg-accent/20 border-accent/40 border text-accent rounded-md p-2 md:size-14 size-10 "
            />
            <div className="">
              <h5 className="text-accent">Harga</h5>
              <p className="body-sm text-foreground/70">
                {`Rp ${detailCompetition?.prize.toLocaleString("id-ID")}`}
              </p>
            </div>
          </div>
          <div className="bg-background w-full flex items-center gap-4 px-5 py-3 md:px-10  md:py-7 rounded-2xl shadow-md border border-accent/40">
            <Landmark
              size={16}
              className="bg-accent/20 border-accent/40 border text-accent rounded-md p-2 md:size-14 size-10 "
            />
            <div className="">
              <h5 className="text-accent">Lokasi</h5>
              <p className="body-sm text-foreground/70">
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
      <div className="w-full bg-background p-4 rounded-2xl shadow-md border border-foreground/10 sticky bottom-0">
        <Link href={detailCompetition?.link_registration || "#"}>
          <Button className="w-full" size="lg" variant={"gradient"}>
            Daftar Sekarang
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
