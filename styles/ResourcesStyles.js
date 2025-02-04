import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#171717", // Unified dark background
  },
  container: {
    flex: 1,
    backgroundColor: "#171717", // Matches Routine Builder
    paddingBottom: 60,
  },
  headerGradient: {
    paddingBottom: 16,
    backgroundColor: "#111111", // Consistent with Routine Builder headers
  },
  headerContent: {
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    paddingHorizontal: 16,
  },
  searchCard: {
    backgroundColor: "#252525", // Unified card styling
    margin: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2E2E", // Slight contrast for input background
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
    color: "#9CA3AF", // Muted icon color
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#171717", // Unified background
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  activeTab: {
    backgroundColor: "#3D5AFE",
  },
  tabText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#171717", // Unified theme
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    backgroundColor: "#252525",
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2E2E2E",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cardDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  resourceListContainer: {
    padding: 16,
  },
  resourceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceTextContainer: {
    flex: 1,
  },
  resourceButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  chatIcon: {
    padding: 8,
    color: "#3D5AFE",
  },
});

export default styles;