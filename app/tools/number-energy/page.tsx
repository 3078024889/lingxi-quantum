import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import NumberEnergyTool from "./NumberEnergyTool";

export const metadata = {
  title: "手机号/车牌号数字能量测试 | 灵犀 · Number Energy | Lingxi",
  description: "用数字能量学（81数灵动数体系）测试手机号、车牌号的数字组合含义。",
  alternates: { canonical: "/tools/number-energy" },
};

export default function NumberEnergyPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="px-6 py-20 text-center">
          <div className="bg-void-deep mx-auto max-w-2xl rounded-sm px-8 py-10">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
              <Bi zh="数字能量学" en="Number Energy" />
            </p>
            <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
              <Bi zh="手机号 / 车牌号测试" en="Phone & License Plate Numbers" />
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-9 text-bone-dim">
              <Bi
                zh="每天随身携带、天天使用的号码，也是一种数字能量场。用民俗数字能量学（81数灵动数体系）拆解你的号码，看看它带着怎样的组合含义。"
                en="The numbers you carry every day are also a kind of numeric field. Break down your number using folk number-energy numerology (the 81-number system) and see what combinations it carries."
              />
            </p>
          </div>
        </section>
        <section className="px-6 pb-28">
          <NumberEnergyTool />
        </section>
      </main>
      <Footer />
    </>
  );
}
