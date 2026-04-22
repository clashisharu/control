// app/page.tsx (server component by default)
import InputProvider from "@/app/contexts/InputContext";
import InputSetter from "./components/InputSetter";
import InputGetter from "./components/InputGetter";
import { SelectorToggle, Selector } from "./components/Selector";
import { OpenerProvider } from "@/app/contexts/OpenerContexts"

export default function Home() {
  return (
    <InputProvider>
      <OpenerProvider>
        <div>
          <SelectorToggle />   {/* client component */}
          <InputSetter />      {/* client component */}
          
        <Selector/>
        </div>
        <InputGetter />      {/* client component */}
      </OpenerProvider>
    </InputProvider>
  );
}
