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
const MUTED = "#888888";
const URL_COLOR = "#cccccc";
const DASH_COLOR = "#bbbbbb";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 28,
    paddingVertical: 24,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
  },
  half: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 10,
  },
  topLine: {
    width: "70%",
    borderBottomWidth: 0.75,
    borderBottomColor: GOLD,
    marginBottom: 10,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    textAlign: "center",
    letterSpacing: 0.4,
    maxWidth: 340,
  },
  qrWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  qrImage: {
    width: 140,
    height: 140,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  codePill: {
    fontSize: 13,
    fontFamily: "Courier-Bold",
    color: BLACK,
    letterSpacing: 4,
    borderWidth: 1.2,
    borderColor: BLACK,
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginBottom: 4,
  },
  scanHint: {
    fontSize: 8,
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
  bottomLine: {
    width: "70%",
    borderBottomWidth: 0.75,
    borderBottomColor: GOLD,
    marginTop: 10,
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
      <View style={styles.topLine} />
      <View style={styles.header}>
        <Text style={styles.title}>{eventTitle}</Text>
      </View>
      <View style={styles.qrWrapper}>
        <Image style={styles.qrImage} src={qrDataUrl} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.codePill}>{accessCode}</Text>
        <Text style={styles.scanHint}>{scanHint}</Text>
        <Text style={styles.joinUrl}>{joinUrl}</Text>
      </View>
      <View style={styles.bottomLine} />
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
