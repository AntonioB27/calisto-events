import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

type Props = Readonly<{
  eventTitle: string;
  accessCode: string;
  joinUrl: string;
  qrDataUrl: string;
  cutHereLabel: string;
}>;

const GOLD = "#c5922a";
const BLACK = "#1a1a1a";
const MUTED = "#777777";
const URL_COLOR = "#999999";
const DASH_COLOR = "#bbbbbb";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 28,
    paddingVertical: 20,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
  },
  half: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  separator: {
    width: "88%",
    borderBottomWidth: 0.75,
    borderBottomColor: GOLD,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    textAlign: "center",
    letterSpacing: 0.4,
    maxWidth: 320,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  codePill: {
    fontSize: 13,
    fontFamily: "Courier-Bold",
    color: BLACK,
    letterSpacing: 4,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  scanHint: {
    fontSize: 9,
    color: MUTED,
    fontFamily: "Helvetica-Oblique",
    textAlign: "center",
  },
  joinUrl: {
    fontSize: 7,
    color: URL_COLOR,
    fontFamily: "Courier",
    textAlign: "center",
  },
  cutRow: {
    height: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  cutLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: DASH_COLOR,
    borderBottomStyle: "dashed",
  },
  cutLabel: {
    fontSize: 7,
    color: "#aaaaaa",
    fontFamily: "Helvetica",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});

function HalfCard({ eventTitle, accessCode, joinUrl, qrDataUrl, scanHint }: Omit<Props, "cutHereLabel"> & { scanHint: string }) {
  return (
    <View style={styles.half}>
      <View style={styles.separator} />
      <Text style={styles.title}>{eventTitle}</Text>
      <Image style={styles.qrImage} src={qrDataUrl} />
      <View style={styles.footer}>
        <Text style={styles.codePill}>{accessCode}</Text>
        <Text style={styles.scanHint}>{scanHint}</Text>
        <Text style={styles.joinUrl}>{joinUrl}</Text>
      </View>
      <View style={styles.separator} />
    </View>
  );
}

export function QrPdfDocument({ eventTitle, accessCode, joinUrl, qrDataUrl, cutHereLabel }: Props) {
  const scanHint = "Scan to join";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <HalfCard
          eventTitle={eventTitle}
          accessCode={accessCode}
          joinUrl={joinUrl}
          qrDataUrl={qrDataUrl}
          scanHint={scanHint}
        />
        <View style={styles.cutRow}>
          <View style={styles.cutLine} />
          <Text style={styles.cutLabel}>{cutHereLabel}</Text>
          <View style={styles.cutLine} />
        </View>
        <HalfCard
          eventTitle={eventTitle}
          accessCode={accessCode}
          joinUrl={joinUrl}
          qrDataUrl={qrDataUrl}
          scanHint={scanHint}
        />
      </Page>
    </Document>
  );
}
