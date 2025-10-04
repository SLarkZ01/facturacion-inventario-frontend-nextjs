import { Button } from "@/components/ui/button";
import { BatteryLow } from "lucide-react";

const homepage = () => {
  return (
    <main>
      <div className="flex justify-center items-center h-screen">
        <Button variant="destructive" size="lg" className="rounded-full"
        ><BatteryLow/>Click Me</Button>
      </div>
    </main>
  )
}
export default homepage