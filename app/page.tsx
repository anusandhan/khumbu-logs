import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <main>
      <div className="flex gap-4 flex-row items-end w-1/2">
        <div className="basis-1/3">
          <Label htmlFor="project">Project</Label>
          <Select>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="aire">AIRE</SelectItem>
              <SelectItem value="gena">GenA</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="acquisitions">Acquistions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="basis-1/3">
          <Label htmlFor="date">Date</Label>
          <Select>
            <SelectTrigger id="date">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="next">This Week</SelectItem>
              <SelectItem value="sveltekit">Past Week</SelectItem>
              <SelectItem value="astro">This Month</SelectItem>
              <SelectItem value="nuxt">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="basis-1/3 flex items-end">
          <Button>View Worklogs</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8"> </div>
    </main>
  );
}
