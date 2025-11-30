import { Button } from "@/components/ui/button";
import React from "react";

const page = () => {
  return (
    <div className=" grid justify-center">
      <h3 className="text-center mb-6">Login Here</h3>
      <form className="grid grid-cols-2 gap-y-4 justify-center border p-5 rounded-md ">
        <div className="grid items-center gap-2">
          <label className="body">Username</label>
          <label className="body">Password</label>
        </div>
        <div className="grid gap-4">
          <input
            type="email"
            className=""
            placeholder="masukan email anda .."
          />
          <input type="password" placeholder="masukkan password anda ..." />
        </div>
        <Button className="col-span-2"> Login</Button>
      </form>
    </div>
  );
};

export default page;
