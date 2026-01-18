"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

function Page() {
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

 

    const handleBlocking = async ()=>{
        setLoading(true);
        await fetch("/api/demo/blocking",{ method:"POST"});
        setLoading(false);
    }

    const handleBackground = async ()=>{
        setLoading2(true);
        await fetch("/api/demo/background",{ method:"POST"});
        setLoading2(false);
    }


  return (
    <div className="p-8 space-x-4">
        <Button disabled ={loading} onClick={handleBlocking}>
            {loading ? "Loding..." : "Blocking"}
        </Button>
         <Button disabled ={loading2} onClick={handleBackground}>
            {loading2 ? "Loding..." : "Background"}
        </Button>
    </div>
  )
}
export default Page;