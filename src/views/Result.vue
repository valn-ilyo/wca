<template>
  <v-container fluid class="pa-4 pb-8">
    <!-- Header -->
    <v-row align="center" class="mb-2">
      <v-col cols="auto">
        <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      </v-col>
      <v-col class="text-center">
        <div class="d-flex align-center justify-center ga-2">
          <img src="/icon.svg" height="28" alt="WhatsApp" />
          <span class="text-subtitle-1 text-primary font-weight-bold"
            >WHATSAPP CHAT ANALYZER</span
          >
        </div>
      </v-col>
      <v-col cols="auto">
        <v-btn icon="mdi-download" variant="text" @click="downloadImage" />
      </v-col>
    </v-row>

    <div id="capture">
      <v-row>
        <v-col
          cols="12"
          md="5"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 80, duration: 420 },
          }"
        >
          <v-card variant="tonal" color="primary" rounded="lg" height="100%">
            <v-card-title class="text-subtitle-2 font-weight-bold pt-4 px-4">
              Message Share
            </v-card-title>
            <v-card-text>
              <Pie :data="pieData" :options="pieOptions" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="7"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 180, duration: 420 },
          }"
        >
          <v-card variant="tonal" color="secondary" rounded="lg" height="100%">
            <v-card-title class="text-subtitle-2 font-weight-bold pt-4 px-4">
              Chat Timeline
            </v-card-title>
            <v-card-text>
              <v-progress-linear
                :model-value="activePct"
                color="primary"
                bg-color="white"
                bg-opacity="0.35"
                height="20"
                rounded="pill"
                class="mb-4"
              >
                <template #default="{ value }">
                  <span class="text-caption font-weight-bold text-white">
                    Active {{ Math.round(value) }}% of days
                  </span>
                </template>
              </v-progress-linear>

              <v-list density="compact" bg-color="transparent">
                <v-list-item
                  v-for="row in timelineRows"
                  :key="row.label"
                  class="px-0"
                >
                  <template #prepend>
                    <v-icon
                      :icon="row.icon"
                      size="16"
                      class="mr-2 opacity-70"
                    />
                  </template>
                  <v-list-item-title class="text-caption">{{
                    row.label
                  }}</v-list-item-title>
                  <template #append>
                    <span class="text-caption font-weight-bold">{{
                      row.value
                    }}</span>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col
          cols="12"
          md="6"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 280, duration: 420 },
          }"
        >
          <v-card variant="outlined" rounded="lg" height="100%">
            <v-card-title class="text-subtitle-2 font-weight-bold pt-4 px-4">
              Activity by Hour
            </v-card-title>
            <v-card-text>
              <Bar :data="hourlyData" :options="hourlyOptions" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="6"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 360, duration: 420 },
          }"
        >
          <v-card variant="outlined" rounded="lg" height="100%">
            <v-card-title class="text-subtitle-2 font-weight-bold pt-4 px-4">
              Per Person
            </v-card-title>
            <v-card-text class="pa-2">
              <v-expansion-panels variant="accordion" elevation="0">
                <v-expansion-panel
                  v-for="(pName, idx) in participantNames"
                  :key="pName"
                  :bg-color="
                    idx === 0 ? 'primary' : idx === 1 ? 'secondary' : undefined
                  "
                  rounded="lg"
                  class="mb-1"
                >
                  <v-expansion-panel-title :class="idx < 2 ? 'text-white' : ''">
                    <span class="font-weight-bold">{{ pName }}</span>
                    <span class="text-caption ml-2 opacity-70">
                      {{
                        analytics!.participants[
                          pName
                        ].messageCount.toLocaleString()
                      }}
                      msgs
                    </span>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list density="compact" bg-color="transparent">
                      <v-list-item
                        v-for="stat in participantStats(pName)"
                        :key="stat.label"
                        class="px-0"
                      >
                        <template #prepend>
                          <v-icon
                            :icon="stat.icon"
                            size="14"
                            class="mr-1 opacity-60"
                          />
                        </template>
                        <v-list-item-title class="text-caption">{{
                          stat.label
                        }}</v-list-item-title>
                        <template #append>
                          <span class="text-caption font-weight-bold">{{
                            stat.value
                          }}</span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col
          cols="12"
          md="6"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 440, duration: 420 },
          }"
        >
          <v-card variant="outlined" rounded="lg">
            <v-card-title class="text-subtitle-2 font-weight-bold pt-4 px-4"
              >Top Words</v-card-title
            >
            <v-card-text>
              <v-chip
                v-for="(tw, i) in analytics!.topWords"
                :key="tw.word"
                :color="i === 0 ? 'primary' : i === 1 ? 'secondary' : undefined"
                variant="tonal"
                class="ma-1"
                size="small"
              >
                {{ tw.word }}
                <v-chip size="x-small" class="ml-1" variant="text">{{
                  tw.count
                }}</v-chip>
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="6"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 500, duration: 420 },
          }"
        >
          <v-card variant="outlined" rounded="lg">
            <v-card-title class="text-subtitle-2 font-weight-bold pt-4 px-4"
              >Top Emojis</v-card-title
            >
            <v-card-text>
              <v-chip
                v-for="(te, i) in analytics!.topEmojis"
                :key="te.emoji"
                :color="i === 0 ? 'primary' : undefined"
                variant="tonal"
                class="ma-1"
              >
                {{ te.emoji }}
                <span class="text-caption ml-1">{{ te.count }}</span>
              </v-chip>
              <v-chip
                v-if="!analytics!.topEmojis.length"
                variant="text"
                class="ma-1"
              >
                No emojis found
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col
          v-for="(fact, i) in funFacts"
          :key="fact.label"
          cols="6"
          md="3"
          v-motion
          :initial="{ opacity: 0, scale: 0.88 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { delay: 560 + i * 60, duration: 380 },
          }"
        >
          <v-card
            variant="tonal"
            :color="fact.color"
            rounded="lg"
            class="text-center pa-3"
          >
            <v-icon :icon="fact.icon" size="28" class="mb-1" />
            <div class="text-h6 font-weight-bold">{{ fact.value }}</div>
            <div class="text-caption opacity-80">{{ fact.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Pie, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { Context } from "chartjs-plugin-datalabels/types/context";
import html2canvas from "html2canvas";
import { useChatStore } from "@/stores/chat";
import { formatDuration, normalizeDays } from "@/composables/useAnalyzer";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  BarElement,
);

const router = useRouter();
const chatStore = useChatStore();
const analytics = computed(() => chatStore.analytics!);
const participantNames = computed(() =>
  Object.keys(analytics.value.participants),
);

const PALETTE = [
  "#C8102E",
  "#007A3D",
  "#2563EB",
  "#D97706",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#65A30D",
];
const colorFor = (i: number) => PALETTE[i % PALETTE.length];

/* ── Pie ─────────────────────────────────── */
const pieData = computed(() => ({
  labels: participantNames.value,
  datasets: [
    {
      data: participantNames.value.map(
        (n) => analytics.value.participants[n].messageCount,
      ),
      backgroundColor: participantNames.value.map((_, i) => colorFor(i)),
      borderWidth: 0,
    },
  ],
}));

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { boxWidth: 12, font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx: {
          label: string;
          raw: unknown;
          dataset: { data: unknown[] };
        }) => {
          const total = (ctx.dataset.data as number[]).reduce(
            (a, b) => a + b,
            0,
          );
          const pct = (((ctx.raw as number) / total) * 100).toFixed(1);
          return ` ${ctx.label}: ${(ctx.raw as number).toLocaleString()} (${pct}%)`;
        },
      },
    },
    datalabels: {
      formatter: (value: number, ctx: Context) => {
        const total = (ctx.dataset.data as number[]).reduce(
          (a: number, b: number) => a + b,
          0,
        );
        const pct = ((value / total) * 100).toFixed(1);
        return Number(pct) >= 8 ? `${pct}%` : "";
      },
      color: "#fff",
      font: { weight: "bold" as const, size: 11 },
    },
  },
};

/* ── Hourly bar ──────────────────────────── */
const hourlyData = computed(() => {
  const dist = analytics.value.hourlyDistribution;
  const labels = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "12a";
    if (i < 12) return `${i}a`;
    if (i === 12) return "12p";
    return `${i - 12}p`;
  });
  return {
    labels,
    datasets: [
      {
        data: labels.map((_, i) => dist[i] ?? 0),
        backgroundColor: labels.map((_, i) => {
          if (i >= 6 && i < 12) return "#F59E0B";
          if (i >= 12 && i < 18) return "#007A3D";
          if (i >= 18 && i < 22) return "#C8102E";
          return "#6B7280";
        }),
        borderRadius: 4,
      },
    ],
  };
});

const hourlyOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    datalabels: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { raw: unknown }) =>
          ` ${(ctx.raw as number).toLocaleString()} msgs`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 9 } } },
    y: { display: false },
  },
};

/* ── Timeline ────────────────────────────── */
const activePct = computed(
  () => (analytics.value.activeDays / analytics.value.totalDays) * 100,
);

const timelineRows = computed(() => [
  {
    icon: "mdi-calendar-start",
    label: "First message",
    value: analytics.value.startDate,
  },
  {
    icon: "mdi-calendar-end",
    label: "Last message",
    value: analytics.value.endDate,
  },
  {
    icon: "mdi-calendar-range",
    label: "Duration",
    value: normalizeDays(analytics.value.totalDays),
  },
  {
    icon: "mdi-check-circle-outline",
    label: "Active days",
    value: `${analytics.value.activeDays} of ${analytics.value.totalDays}`,
  },
  {
    icon: "mdi-message-fast",
    label: "Msgs / day",
    value: String(analytics.value.averageMessagesPerDay),
  },
  {
    icon: "mdi-reply",
    label: "Avg response",
    value: analytics.value.averageResponseTime,
  },
  {
    icon: "mdi-fire",
    label: "Longest streak",
    value: `${analytics.value.longestStreak} days`,
  },
  {
    icon: "mdi-trophy",
    label: "Busiest day",
    value: `${analytics.value.busiestDay} (${analytics.value.busiestDayCount} msgs)`,
  },
]);

/* ── Per-participant ─────────────────────── */
function participantStats(name: string) {
  const p = analytics.value.participants[name];
  return [
    {
      icon: "mdi-message-outline",
      label: "Messages",
      value: p.messageCount.toLocaleString(),
    },
    {
      icon: "mdi-text",
      label: "Words sent",
      value: p.wordCount.toLocaleString(),
    },
    {
      icon: "mdi-image-outline",
      label: "Media shared",
      value: p.mediaCount.toLocaleString(),
    },
    {
      icon: "mdi-link",
      label: "Links shared",
      value: p.linkCount.toLocaleString(),
    },
    {
      icon: "mdi-emoticon-outline",
      label: "Emojis used",
      value: p.emojiCount.toLocaleString(),
    },
    {
      icon: "mdi-reply",
      label: "Avg response",
      value:
        p.avgResponseTime != null ? formatDuration(p.avgResponseTime) : "N/A",
    },
    {
      icon: "mdi-chat-outline",
      label: "Conversations started",
      value: p.initiations.toLocaleString(),
    },
  ];
}

/* ── Fun facts ───────────────────────────── */
const funFacts = computed(() => [
  {
    icon: "mdi-message-text",
    label: "Total messages",
    value: analytics.value.messageCount.toLocaleString(),
    color: "primary",
  },
  {
    icon: "mdi-format-text",
    label: "Total words",
    value: analytics.value.totalWords.toLocaleString(),
    color: "secondary",
  },
  {
    icon: "mdi-image-multiple",
    label: "Media shared",
    value: analytics.value.mediaCount.toLocaleString(),
    color: undefined,
  },
  {
    icon: "mdi-link-variant",
    label: "Links shared",
    value: analytics.value.linkCount.toLocaleString(),
    color: undefined,
  },
]);

/* ── Download ────────────────────────────── */
function downloadImage(): void {
  const el = document.getElementById("capture");
  if (!el) return;
  html2canvas(el, { scale: 2, useCORS: true }).then((canvas) => {
    const a = document.createElement("a");
    a.download = "wca-report.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  });
}
</script>
