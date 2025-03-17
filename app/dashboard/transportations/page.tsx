import { lusitana } from '@/app/ui/fonts';

export default async function Page() {

  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          TRANSPORTATIONS
        </h1>
      </main>
    );
}