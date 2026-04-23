// app/page.tsx (server component by default)
import InputProvider from "@/app/contexts/InputContext";
import InputSetter from "./components/InputSetter";
import InputGetter from "./components/InputGetter";
import { SelectorToggle, Selector } from "./components/Selector";
import { OpenerProvider } from "@/app/contexts/OpenerContexts"
import Scene from "@/app/components/Scene"

export default function Home() {
  return (
    <InputProvider>
      <OpenerProvider>
        <div>
          <SelectorToggle />   
          <InputSetter />      
          
        <Selector/>
        </div>
        <Scene />      {/* client component */}
      </OpenerProvider>
    </InputProvider>
  );
}
