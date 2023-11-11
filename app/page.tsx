"use client";

import Image from "next/image";

import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import MenuView from "./components/MenuView";
import SelectView from "./components/SelectView";
import InputView from "./components/InputView";

export default function Home() {
  const [coin, setCoin] = useState<string>();
  const [level, setLevel] = useState<string>();
  const [dbName, setDBName] = useState<string>("");
  const [collectionName, setCollectionName] = useState<string>("");
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full lg:flex">
        <SelectView defaultTitle="Coin" title={coin} items={['btc', 'eth']} onItemPress={setCoin} />
        <SelectView defaultTitle="Level" title={level} items={['1h', '4h']} onItemPress={setLevel} />
        <InputView label="DB Name" value={dbName} setVale={setDBName} />
        <InputView label="Collection Name" value={collectionName} setVale={setCollectionName} />
        {/* <MenuView defaultTitle="coin" title={coin} items={['btc', 'eth']} onItemPress={setCoin} /> */}
        {/* <MenuView defaultTitle="level" title={level} items={['1h', '4h']} onItemPress={setLevel} /> */}
      </div>
    </main>
  );
}
