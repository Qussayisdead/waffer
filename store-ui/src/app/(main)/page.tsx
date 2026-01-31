"use client";

import { useEffect, useRef, useState } from "react";
import { cachedRequest } from "../../lib/api";

const brandName = "\u0648\u0641\u0651\u0631";
const stores = [
  {
    name: "\u0628\u0646 \u0627\u0644\u062c\u0628\u0644",
    category: "\u0645\u062d\u0627\u0645\u0635 \u0648\u0645\u0643\u0633\u0631\u0627\u062a",
    location: "\u0631\u0627\u0645 \u0627\u0644\u0644\u0647",
    facebook: "#",
    instagram: "#"
  },
  {
    name: "\u0627\u0644\u0647\u0644\u0627\u0644",
    category: "\u0633\u0648\u0628\u0631 \u0645\u0627\u0631\u0643\u062a",
    location: "\u0646\u0627\u0628\u0644\u0633",
    facebook: "#",
    instagram: "#"
  },
  {
    name: "\u062a\u0645\u0648\u064a\u0646\u0627\u062a \u0627\u0644\u062d\u064a",
    category: "\u0628\u0642\u0627\u0644\u0629 \u0648\u062d\u0644\u0648\u064a\u0627\u062a",
    location: "\u0627\u0644\u062e\u0644\u064a\u0644",
    facebook: "#",
    instagram: "#"
  }
];

const defaultAds = [
  {
    title: "حملة خصم العيد",
    body: "خصم مميز لمدة محدودة للعملاء المشاركين.",
    date: "هذا الاسبوع",
    link_url: "",
    image_url: ""
  },
  {
    title: "مكافآت أكبر",
    body: "استبدل نقاطك بقسائم قيمتها أعلى.",
    date: "هذا الشهر",
    link_url: "",
    image_url: ""
  },
  {
    title: "شراكات جديدة",
    body: "انضمام متاجر جديدة للشبكة.",
    date: "اليوم",
    link_url: "",
    image_url: ""
  }
];

export default function LandingPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
  const [ads, setAds] = useState(defaultAds);
  const storesTrackRef = useRef<HTMLDivElement | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [chatInput, setChatInput] = useState("");
          
  const [chatMessages, setChatMessages] = useState<
    { id: number; role: "user" | "bot"; text: string }[]
  >([
    {
      id: 1,
      role: "bot",
      text: "\u0623\u0647\u0644\u064b\u0627 \u0628\u0643! \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062f\u0643 \u0647\u0646\u0627 \u0644\u0644\u0625\u062c\u0627\u0628\u0629 \u0639\u0646 \u0643\u0644 \u0634\u064a\u0621 \u064a\u062e\u0635 \u0648\u0641\u0651\u0631: \u0627\u0644\u062a\u0633\u062c\u064a\u0644\u060c \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a\u060c \u0627\u0644\u062e\u0635\u0648\u0645\u0627\u062a\u060c \u0627\u0644\u0646\u0642\u0627\u0637\u060c \u0644\u0648\u062d\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629\u060c \u0648\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631."
    }
  ]);

  const faqs = [
    {
      question: "\u0643\u064a\u0641 \u0623\u0633\u062c\u0644 \u0643\u0639\u0645\u064a\u0644 \u0648\u0623\u0628\u062f\u0623 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0648\u0641\u0651\u0631\u061f",
      answer: "\u0633\u062c\u0651\u0644 \u0643\u0639\u0645\u064a\u0644 \u0645\u0646 \u0635\u0641\u062d\u0629 \u0627\u0644\u062a\u0633\u062c\u064a\u0644\u060c \u062b\u0645 \u0627\u062e\u062a\u0631 \u0627\u0644\u0645\u062a\u062c\u0631 \u0627\u0644\u0630\u064a \u062a\u0631\u064a\u062f \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0643\u0648\u062f \u0644\u0647. \u0628\u0639\u062f \u0630\u0644\u0643 \u064a\u0638\u0647\u0631 \u0644\u0643 \u0628\u0627\u0631\u0643\u0648\u062f/QR \u062a\u0633\u062a\u062e\u062f\u0645\u0647 \u0639\u0646\u062f \u0627\u0644\u0643\u0627\u0634\u064a\u0631 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062e\u0635\u0645."
    },
    {
      question: "\u0645\u0627 \u0647\u064a \u0628\u0637\u0627\u0642\u0629 \u0643\u0628\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 (Golden)\u061f",
      answer: "\u0628\u0637\u0627\u0642\u0629 VIP \u062a\u0645\u0646\u062d \u0645\u0632\u0627\u064a\u0627 \u0625\u0636\u0627\u0641\u064a\u0629 \u0645\u062b\u0644 \u0639\u0631\u0648\u0636 \u062e\u0627\u0635\u0629 \u0648\u062f\u0639\u0645 \u0623\u0648\u0644\u0648\u064a\u0629. \u064a\u0645\u0643\u0646\u0643 \u0637\u0644\u0628\u0647\u0627 \u0645\u0646 \u0635\u0641\u062d\u0629 \u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0648\u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0641\u0631\u064a\u0642\u0646\u0627 \u0645\u0639\u0643 \u0644\u0627\u0633\u062a\u0643\u0645\u0627\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a."
    },
    {
      question: "\u0643\u064a\u0641 \u0623\u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0630\u0647\u0628\u064a\u0629\u061f",
      answer: "\u0627\u062f\u062e\u0644 \u0639\u0644\u0649 \u0635\u0641\u062d\u0629 \u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629\u060c \u0639\u0628\u0651\u0626 \u0627\u0644\u0627\u0633\u0645 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641/\u0627\u0644\u0628\u0631\u064a\u062f \u0648\u0627\u0644\u0645\u062f\u064a\u0646\u0629\u060c \u062b\u0645 \u0623\u0631\u0633\u0644 \u0627\u0644\u0637\u0644\u0628. \u0633\u062a\u0635\u0644\u0643 \u0645\u062a\u0627\u0628\u0639\u0629 \u0645\u0646 \u0627\u0644\u0641\u0631\u064a\u0642."
    },
    {
      question: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064a\u0646 \u0627\u0644\u0640 QR \u0648\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f 1D\u061f",
      answer: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f 1D \u0645\u0646\u0627\u0633\u0628 \u0644\u0623\u062c\u0647\u0632\u0629 \u0627\u0644\u0645\u0633\u062d \u0641\u064a \u0627\u0644\u0645\u062a\u0627\u062c\u0631\u060c \u0648\u0627\u0644\u0640 QR \u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0645\u0633\u062d \u0628\u0627\u0644\u062c\u0648\u0627\u0644. \u064a\u0645\u0643\u0646\u0643 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0623\u064a \u0645\u0646\u0647\u0645\u0627 \u062d\u0633\u0628 \u0627\u0644\u062c\u0647\u0627\u0632."
    },
    {
      question: "\u0643\u064a\u0641 \u064a\u062a\u0645 \u062a\u0648\u0644\u064a\u062f \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f/\u0627\u0644\u0640 QR\u061f",
      answer: "\u0645\u0646 \u0644\u0648\u062d\u0629 \u0627\u0644\u0639\u0645\u064a\u0644 \u0627\u062e\u062a\u0631 \u0627\u0644\u0645\u062a\u062c\u0631\u060c \u064a\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0643\u0648\u062f \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0645\u0639 \u0646\u0633\u0628\u0629 \u062e\u0635\u0645 \u0627\u0644\u0645\u062a\u062c\u0631 \u0648\u0645\u062f\u0629 \u0635\u0644\u0627\u062d\u064a\u0629 \u0645\u062d\u062f\u062f\u0629."
    },
    {
      question: "\u0645\u0627 \u0647\u064a \u0646\u0633\u0628\u0629 \u0627\u0644\u062e\u0635\u0645 \u0648\u0645\u0646 \u064a\u062d\u062f\u062f\u0647\u0627\u061f",
      answer: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062e\u0635\u0645 \u064a\u062d\u062f\u062f\u0647\u0627 \u0627\u0644\u0623\u062f\u0645\u0646 \u0639\u0646\u062f \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u062a\u062c\u0631. \u0627\u0644\u0639\u0645\u064a\u0644 \u064a\u0623\u062e\u0630 \u0646\u0641\u0633 \u0646\u0633\u0628\u0629 \u062e\u0635\u0645 \u0627\u0644\u0645\u062a\u062c\u0631 \u0639\u0646\u062f \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0643\u0648\u062f."
    },
    {
      question: "\u0643\u064a\u0641 \u064a\u0639\u0645\u0644 \u0627\u0644\u0643\u0627\u0634\u064a\u0631/\u0627\u0644\u062a\u0631\u0645\u064a\u0646\u0627\u0644\u061f",
      answer: "\u0627\u0644\u0643\u0627\u0634\u064a\u0631 \u064a\u0645\u0633\u062d \u0627\u0644\u0643\u0648\u062f\u060c \u0627\u0644\u0646\u0638\u0627\u0645 \u064a\u062c\u0644\u0628 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0644 \u0648\u0627\u0644\u062e\u0635\u0645 \u0648\u064a\u062d\u0633\u0628 \u0627\u0644\u0645\u0628\u0644\u063a \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u0645\u0628\u0627\u0634\u0631\u0629."
    },
    {
      question: "\u0643\u064a\u0641 \u062a\u0639\u0645\u0644 \u0627\u0644\u0646\u0642\u0627\u0637 \u0648\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062a\u061f",
      answer: "\u0628\u0639\u062f \u0643\u0644 \u0639\u0645\u0644\u064a\u0629\u060c \u0627\u0644\u0639\u0645\u064a\u0644 \u064a\u0643\u0633\u0628 \u0646\u0642\u0627\u0637 \u062d\u0633\u0628 \u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0645\u062a\u062c\u0631. \u064a\u0645\u0643\u0646 \u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0627\u0644\u0646\u0642\u0627\u0637 \u0628\u0642\u0633\u0627\u0626\u0645 \u0623\u0648 \u0645\u0643\u0627\u0641\u0622\u062a."
    },
    {
      question: "\u0643\u064a\u0641 \u0623\u0636\u064a\u0641 \u0645\u062a\u062c\u0631 \u062c\u062f\u064a\u062f \u0648\u0645\u0627 \u0647\u064a \u0627\u0644\u0639\u0645\u0648\u0644\u0629\u061f",
      answer: "\u0645\u0646 \u0644\u0648\u062d\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0623\u0636\u0641 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0631 \u0648\u062d\u062f\u062f \u0646\u0633\u0628\u0629 \u0627\u0644\u062e\u0635\u0645 \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0629. \u0627\u0644\u0639\u0645\u0648\u0644\u0629 \u062a\u0638\u0647\u0631 \u0636\u0645\u0646 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631."
    },
    {
      question: "\u0623\u064a\u0646 \u0623\u0631\u0649 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0648\u0627\u0644\u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a\u061f",
      answer: "\u0644\u0648\u062d\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u062a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u062a\u0642\u0627\u0631\u064a\u0631 \u0634\u0647\u0631\u064a\u0629 \u0648\u064a\u0648\u0645\u064a\u0629\u060c \u0648\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0648\u0627\u0644\u062e\u0635\u0648\u0645\u0627\u062a \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062a."
    },
    {
      question: "\u0643\u064a\u0641 \u0623\u0633\u062a\u062e\u062f\u0645 \u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u061f",
      answer: "\u0627\u0644\u0623\u062f\u0645\u0646 \u064a\u0645\u0643\u0646\u0647 \u0625\u0635\u062f\u0627\u0631 \u0628\u0637\u0627\u0642\u0629 \u0644\u0639\u0645\u064a\u0644 \u0645\u0648\u062c\u0648\u062f\u060c \u0623\u0648 \u062a\u0631\u0643 \u0627\u0644\u0639\u0645\u064a\u0644 \u064a\u0646\u0634\u0626 \u0643\u0648\u062f\u0647 \u0628\u0646\u0641\u0633\u0647 \u0639\u0628\u0631 \u0644\u0648\u062d\u0629 \u0627\u0644\u0639\u0645\u064a\u0644."
    },
    {
      question: "\u0647\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0622\u0645\u0646\u0629\u061f",
      answer: "\u0646\u0639\u0645\u060c \u064a\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0641\u064a \u0642\u0627\u0639\u062f\u0629 \u0628\u064a\u0627\u0646\u0627\u062a \u0622\u0645\u0646\u0629\u060c \u0645\u0639 \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0648\u0627\u0636\u062d\u0629 \u0628\u064a\u0646 \u0627\u0644\u0639\u0645\u064a\u0644 \u0648\u0627\u0644\u0643\u0627\u0634\u064a\u0631 \u0648\u0627\u0644\u0623\u062f\u0645\u0646."
    },
    {
      question: "\u0643\u064a\u0641 \u0623\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645\u061f",
      answer: "\u064a\u0645\u0643\u0646\u0643 \u0645\u0631\u0627\u0633\u0644\u062a\u0646\u0627 \u0639\u0628\u0631 \u0627\u0644\u0628\u0631\u064a\u062f \u0623\u0648 \u0627\u0644\u0647\u0627\u062a\u0641 \u0627\u0644\u0645\u0630\u0643\u0648\u0631 \u0641\u064a \u0623\u0633\u0641\u0644 \u0627\u0644\u0635\u0641\u062d\u0629\u060c \u0648\u0633\u0646\u0631\u062f \u0639\u0644\u064a\u0643 \u0633\u0631\u064a\u0639\u0627\u064b."
    }
  ];

  const respondToMessage = (input: string) => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return "\u0627\u0643\u062a\u0628 \u0633\u0624\u0627\u0644\u0643 \u0648\u0633\u0623\u0633\u0627\u0639\u062f\u0643 \u0641\u0648\u0631\u0627\u064b.";
    if (normalized.includes("\u0628\u0637\u0627\u0642\u0629") || normalized.includes("vip") || normalized.includes("golden")) {
      return "\u0628\u0637\u0627\u0642\u0629 \u0643\u0628\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062a\u0645\u0646\u062d \u0645\u0632\u0627\u064a\u0627 \u0625\u0636\u0627\u0641\u064a\u0629 \u0648\u0639\u0631\u0648\u0636 \u062e\u0627\u0635\u0629. \u064a\u0645\u0643\u0646\u0643 \u0637\u0644\u0628\u0647\u0627 \u0645\u0646 \u0635\u0641\u062d\u0629 \u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0648\u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0641\u0631\u064a\u0642\u0646\u0627 \u0645\u0639\u0643.";
    }
    if (normalized.includes("\u0637\u0644\u0628") || normalized.includes("\u062a\u0642\u062f\u064a\u0645") || normalized.includes("application")) {
      return "\u0644\u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629: \u0627\u0641\u062a\u062d \u0635\u0641\u062d\u0629 \u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629\u060c \u0639\u0628\u0651\u0626 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a\u060c \u0648\u0627\u0636\u063a\u0637 \u0625\u0631\u0633\u0627\u0644. \u0633\u064a\u062a\u0627\u0628\u0639 \u0627\u0644\u0641\u0631\u064a\u0642 \u0627\u0644\u0637\u0644\u0628.";
    }
    if (normalized.includes("\u062a\u0633\u062c\u064a\u0644") || normalized.includes("signup") || normalized.includes("register")) {
      return "\u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0643\u0639\u0645\u064a\u0644 \u0645\u0646 \u0635\u0641\u062d\u0629 \u0627\u0644\u062a\u0633\u062c\u064a\u0644\u060c \u062b\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0648\u062d\u0629 \u0627\u0644\u0639\u0645\u064a\u0644 \u0648\u062a\u0648\u0644\u064a\u062f \u0627\u0644\u0643\u0648\u062f.";
    }
    if (normalized.includes("\u062f\u062e\u0648\u0644") || normalized.includes("login") || normalized.includes("\u062a\u0633\u062c\u064a\u0644 \u062f\u062e\u0648\u0644")) {
      return "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0631\u064a\u062f \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u0625\u0630\u0627 \u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u060c \u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645 \u0644\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0647\u064a\u0626\u0629.";
    }
    if (normalized.includes("\u062e\u0635\u0645") || normalized.includes("discount")) {
      return "\u0646\u0633\u0628\u0629 \u0627\u0644\u062e\u0635\u0645 \u064a\u062d\u062f\u062f\u0647\u0627 \u0627\u0644\u0623\u062f\u0645\u0646 \u0644\u0643\u0644 \u0645\u062a\u062c\u0631. \u0639\u0646\u062f \u0625\u0646\u0634\u0627\u0621 \u0643\u0648\u062f \u0644\u0644\u0645\u062a\u062c\u0631 \u062a\u062d\u0635\u0644 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0639\u0644\u0649 \u0646\u0633\u0628\u0629 \u062e\u0635\u0645\u0647.";
    }
    if (normalized.includes("\u0639\u0645\u0648\u0644\u0629") || normalized.includes("commission")) {
      return "\u0627\u0644\u0639\u0645\u0648\u0644\u0629 \u062a\u064f\u062d\u062f\u062f \u0639\u0646\u062f \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u062a\u062c\u0631 \u0648\u062a\u0638\u0647\u0631 \u0641\u064a \u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631.";
    }
    if (normalized.includes("\u0646\u0642\u0627\u0637") || normalized.includes("points") || normalized.includes("\u0645\u0643\u0627\u0641")) {
      return "\u0627\u0644\u0646\u0642\u0627\u0637 \u062a\u064f\u062d\u062a\u0633\u0628 \u0628\u0639\u062f \u0643\u0644 \u0639\u0645\u0644\u064a\u0629 \u062d\u0633\u0628 \u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0645\u062a\u062c\u0631 \u0648\u064a\u0645\u0643\u0646 \u0627\u0633\u062a\u0628\u062f\u0627\u0644\u0647\u0627 \u0628\u0642\u0633\u0627\u0626\u0645 \u0623\u0648 \u0645\u0643\u0627\u0641\u0622\u062a.";
    }
    if (normalized.includes("\u0642\u0633\u064a\u0645\u0629") || normalized.includes("voucher") || normalized.includes("\u0645\u0643\u0627\u0641\u0623\u0629")) {
      return "\u0627\u0644\u0642\u0633\u0627\u0626\u0645 \u062a\u064f\u0635\u062f\u0631 \u0639\u0628\u0631 \u0644\u0648\u062d\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0623\u0648 \u0648\u0641\u0642 \u0646\u0638\u0627\u0645 \u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062a\u060c \u0648\u062a\u0638\u0647\u0631 \u0644\u0644\u0639\u0645\u064a\u0644 \u0641\u064a \u0644\u0648\u062d\u0629 \u062d\u0633\u0627\u0628\u0647.";
    }
    if (normalized.includes("\u0628\u0627\u0631\u0643\u0648\u062f") || normalized.includes("barcode") || normalized.includes("1d")) {
      return "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f 1D \u0645\u0646\u0627\u0633\u0628 \u0644\u0623\u062c\u0647\u0632\u0629 \u0627\u0644\u0645\u0633\u062d \u0641\u064a \u0627\u0644\u0645\u062d\u0644\u0627\u062a. \u064a\u0645\u0643\u0646\u0643 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647 \u0628\u062f\u0644 \u0627\u0644\u0640 QR \u0625\u0630\u0627 \u0643\u0627\u0646\u062a \u0627\u0644\u0623\u062c\u0647\u0632\u0629 \u0644\u0627 \u062a\u062f\u0639\u0645 QR.";
    }
    if (normalized.includes("qr") || normalized.includes("\u0643\u064a\u0648") || normalized.includes("\u0631\u0645\u0632")) {
      return "\u0631\u0645\u0632 QR \u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0645\u0633\u062d \u0628\u0627\u0644\u062c\u0648\u0627\u0644 \u0648\u064a\u0645\u0643\u0646 \u0639\u0631\u0636\u0647 \u0628\u062c\u0627\u0646\u0628 \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f \u0644\u064a\u0633\u062a\u0641\u064a\u062f \u0627\u0644\u062c\u0645\u064a\u0639.";
    }
    if (normalized.includes("\u0643\u0627\u0634\u064a\u0631") || normalized.includes("terminal") || normalized.includes("\u062a\u0631\u0645\u064a\u0646\u0627\u0644")) {
      return "\u0627\u0644\u0643\u0627\u0634\u064a\u0631 \u064a\u0645\u0633\u062d \u0627\u0644\u0643\u0648\u062f\u060c \u0648\u064a\u0638\u0647\u0631 \u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064a\u0644 \u0648\u0627\u0644\u062e\u0635\u0645 \u0648\u0627\u0644\u0645\u0628\u0644\u063a \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u0645\u0628\u0627\u0634\u0631\u0629.";
    }
    if (normalized.includes("\u0645\u062a\u062c\u0631") || normalized.includes("store")) {
      return "\u0627\u0644\u0623\u062f\u0645\u0646 \u064a\u0636\u064a\u0641 \u0627\u0644\u0645\u062a\u062c\u0631 \u0648\u064a\u062d\u062f\u062f \u0627\u0644\u062e\u0635\u0645 \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0629. \u0627\u0644\u0639\u0645\u064a\u0644 \u064a\u062e\u062a\u0627\u0631 \u0627\u0644\u0645\u062a\u062c\u0631 \u0641\u064a \u0644\u0648\u062d\u0629 \u0627\u0644\u0639\u0645\u064a\u0644 \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0643\u0648\u062f.";
    }
    if (normalized.includes("\u0627\u062f\u0645\u0646") || normalized.includes("admin") || normalized.includes("\u0625\u062f\u0627\u0631\u0629")) {
      return "\u0644\u0648\u062d\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u062a\u0627\u062c\u0631 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0643\u0627\u0634\u064a\u0631\u060c \u0648\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062a \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a.";
    }
    if (normalized.includes("\u062a\u0642\u0631\u064a\u0631") || normalized.includes("report") || normalized.includes("\u0641\u0648\u0627\u062a\u064a\u0631")) {
      return "\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629 \u0641\u064a \u0644\u0648\u062d\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0648\u062a\u0639\u0631\u0636 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a\u060c \u0627\u0644\u062e\u0635\u0648\u0645\u0627\u062a\u060c \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062a \u0645\u0639 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631.";
    }
    if (normalized.includes("\u062f\u0639\u0645") || normalized.includes("\u062a\u0648\u0627\u0635\u0644") || normalized.includes("help")) {
      return "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 \u0639\u0628\u0631 \u0627\u0644\u0628\u0631\u064a\u062f \u0623\u0648 \u0627\u0644\u0647\u0627\u062a\u0641 \u0641\u064a \u0623\u0633\u0641\u0644 \u0627\u0644\u0635\u0641\u062d\u0629\u060c \u0648\u0633\u0646\u0631\u062f \u0639\u0644\u064a\u0643 \u0628\u0633\u0631\u0639\u0629.";
    }
    return "\u0644\u0645 \u0623\u0641\u0647\u0645 \u0627\u0644\u0633\u0624\u0627\u0644 \u062a\u0645\u0627\u0645\u0627\u064b. \u062c\u0631\u0651\u0628 \u0635\u064a\u0627\u063a\u062a\u0647 \u0628\u0643\u0644\u0645\u0627\u062a \u0645\u062b\u0644: \u062e\u0635\u0645\u060c \u0646\u0642\u0627\u0637\u060c \u0628\u0637\u0627\u0642\u0629\u060c \u0643\u0627\u0634\u064a\u0631\u060c \u0645\u062a\u062c\u0631\u060c \u0623\u0648 \u0625\u062f\u0627\u0631\u0629.";
  };

  const handleChatSend = () => {
    const input = chatInput.trim();
    if (!input) return;
    const userMessage = {
      id: Date.now(),
      role: "user" as const,
      text: input
    };
    const botMessage = {
      id: Date.now() + 1,
      role: "bot" as const,
      text: respondToMessage(input)
    };
    setChatMessages((prev) => [...prev, userMessage, botMessage]);
    setChatInput("");
  };

  useEffect(() => {
    const loadAds = async () => {
      try {
        type AdApiItem = {
          title: string;
          body: string;
          link_url?: string | null;
          image_url?: string | null;
          created_at: string;
        };
        const response = await cachedRequest<AdApiItem[]>("/api/v1/public/ads", undefined, 60000);
        const items = response.data.map((item) => ({
          title: item.title,
          body: item.body,
          link_url: item.link_url || "",
          image_url: item.image_url ? `${baseUrl}${item.image_url}` : "",
          date: new Date(item.created_at).toLocaleDateString("ar-EG")
        }));
        if (items.length > 0) setAds(items);
      } catch {
        setAds(defaultAds);
      }
    };
    loadAds();
  }, [baseUrl]);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0", "scale-100");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleStoresScroll = (direction: "left" | "right") => {
    const track = storesTrackRef.current;
    if (!track) return;
    const scrollAmount = Math.min(420, track.clientWidth * 0.8);
    track.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-black">
      <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-100/70 blur-3xl animate-float-slow" />
      <div
        className="absolute right-0 top-20 h-80 w-80 translate-x-1/3 rounded-full bg-black/5 blur-3xl animate-float-slow"
        style={{ animationDelay: "2s" }}
      />

      <header className="relative z-10 px-6 pt-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-black/10 bg-white/80 px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 shadow-sm">
              <img className="h-20 w-20 object-contain" src="/logo.png" alt="Logo" />
            </div>
            <div>
              <p className="text-lg font-semibold text-black">\u0645\u0633\u0627\u0639\u062f \u0633\u0631\u064a\u0639</p>
              <p className="text-xs text-black/60">\u0631\u062d\u0644\u062a\u0643 \u0646\u062d\u0648 \u0627\u0644\u062a\u0648\u0641\u064a\u0631 \u062a\u0628\u062f\u0623 \u0645\u0646 \u0647\u0646\u0627</p>
            </div>
          </div>
                          <a
                  className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  href="/vip-card-application"
                >
                  \u0642\u062f\u0651\u0645 \u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629</a>
                <a className="text-sm font-semibold text-emerald-700" href="/choose-role">
                  اعرف المزيد
                </a>
              </div>
            </div>
            <div className="relative">
              <div
                data-reveal
                className="relative overflow-hidden rounded-[32px] border border-amber-200/60 bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-400 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)] opacity-0 translate-y-6 scale-95 transition-all duration-700"
              >
                <svg viewBox="0 0 520 320" className="h-full w-full" role="img" aria-label="Golden QR code card">
                  <defs>
                    <linearGradient id="goldenCardGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="45%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="goldenCardGlow" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <rect x="12" y="12" width="496" height="296" rx="28" fill="url(#goldenCardGradient)" />
                  <rect x="28" y="28" width="464" height="264" rx="24" fill="url(#goldenCardGlow)" opacity="0.6" />
                  <rect x="44" y="62" width="140" height="96" rx="14" fill="rgba(0,0,0,0.15)" />
                  <rect x="58" y="76" width="36" height="36" rx="6" fill="rgba(0,0,0,0.35)" />
                  <rect x="102" y="76" width="68" height="12" rx="6" fill="rgba(0,0,0,0.28)" />
                  <rect x="102" y="96" width="68" height="12" rx="6" fill="rgba(0,0,0,0.28)" />
                  <rect x="58" y="126" width="112" height="12" rx="6" fill="rgba(0,0,0,0.28)" />
                  <rect x="320" y="72" width="140" height="140" rx="18" fill="rgba(0,0,0,0.2)" />
                  <rect x="336" y="88" width="36" height="36" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="380" y="88" width="64" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="380" y="108" width="64" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="336" y="132" width="108" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="336" y="152" width="108" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="336" y="172" width="108" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <text x="56" y="214" fill="rgba(0,0,0,0.55)" fontSize="18" fontWeight="600">
                    GOLDEN VIP CARD
                  </text>
                  <text x="56" y="246" fill="rgba(0,0,0,0.4)" fontSize="14">
                    5288 9031 4521 1149
                  </text>
                  <text x="56" y="272" fill="rgba(0,0,0,0.4)" fontSize="12">
                    VALID 12/28
                  </text>
                </svg>
              </div>
              <div className="absolute -bottom-6 left-6 rounded-2xl border border-amber-200/60 bg-white/80 px-4 py-3 text-xs font-semibold text-black shadow-[0_15px_35px_rgba(0,0,0,0.15)] backdrop-blur">
                يشمل عضوية المستوى الذهبي
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black/95 px-6 py-16 text-white" id="stores">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-300">{"\u0645\u062a\u0627\u062c\u0631\u0646\u0627"}</p>
                <h2 className="text-2xl font-semibold">{"\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u062a\u0627\u062c\u0631 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629"}</h2>
              </div>
              <p className="max-w-md text-sm text-white/70">
                {"\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0645\u062a\u0627\u062c\u0631 \u0645\u062e\u062a\u0627\u0631\u0629 \u0645\u0646 \u0634\u0628\u0643\u062a\u0646\u0627."}
              </p>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/90 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/90 to-transparent" />
              <button
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-sm text-white transition hover:bg-emerald-600"
                type="button"
                onClick={() => handleStoresScroll("left")}
                aria-label="Scroll left"
              >
                {"<"}
              </button>
              <button
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-sm text-white transition hover:bg-emerald-600"
                type="button"
                onClick={() => handleStoresScroll("right")}
                aria-label="Scroll right"
              >
                {">"}
              </button>
              <div
                ref={storesTrackRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
              >
                {stores.map((store) => (
                  <div
                    data-reveal
                    className="flex min-w-[260px] snap-start flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 opacity-0 translate-y-6 scale-95 transition-all duration-700 sm:min-w-[320px]"
                    key={store.name}
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{store.name}</h3>
                      <p className="text-sm text-white/70">{store.category}</p>
                      <p className="text-xs text-white/50">{"\u0627\u0644\u0645\u0648\u0642\u0639: "}{store.location}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                                      <a
                  className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  href="/vip-card-application"
                >
                  \u0642\u062f\u0651\u0645 \u0637\u0644\u0628 \u0627\u0644\u0628\u0637\u0627\u0642\u0629</a>
            </div>
          </div>
        )}
        <button
          type="button"
          className="flex items-center gap-3 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(16,185,129,0.4)] transition hover:bg-emerald-800"
          onClick={() => setIsFaqOpen((prev) => !prev)}
          aria-expanded={isFaqOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 17l-1 4 4-1 9-9a2.8 2.8 0 0 0-4-4l-9 9z" />
              <path d="M14 7l4 4" />
            </svg>
          </span>
          {isFaqOpen ? "\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629" : "\u0645\u0633\u0627\u0639\u062f \u0633\u0631\u064a\u0639"}
        </button>
      </div>
    </div>
  );
}
