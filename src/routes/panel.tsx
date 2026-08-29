import { createFileRoute } from "@tanstack/react-router";

import { PanelLayout } from "@/layouts/panel-layout";

export const Route = createFileRoute("/panel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Yönetim paneli · QR Sofra" },
      { name: "description", content: "Marka, şube, menü, sipariş ve platform ayarlarını tek panelden yönetin." },
      { property: "og:title", content: "Yönetim paneli · QR Sofra" },
      { property: "og:description", content: "QR Sofra yönetim paneli: markalar, planlar, temalar, eklentiler ve siparişler." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelLayout,
});
