import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import TransactionService from "../services/transactionService";
import CategoryService from "../services/categoryService";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function AllTransactionsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Search State
  const [searchText, setSearchText] = useState("");
  const [searchTimer, setSearchTimer] = useState(null);

  // Filter State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categoryId: null,
    startDate: null,
    endDate: null,
  });
  const [tempFilters, setTempFilters] = useState({
    categoryId: null,
    startDate: null,
    endDate: null,
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadTransactions(1);
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (e) {
      console.log("Failed to load categories", e);
    }
  };

  const loadTransactions = async (
    pageNum,
    search = searchText,
    currentFilters = filters,
  ) => {
    if (loading && pageNum > 1) return; // Allow reload if page 1
    if (pageNum === 1) setLoading(true);

    try {
      // Pass params object with search and filters
      const params = { page: pageNum };
      if (search) params.search = search;
      if (currentFilters.categoryId)
        params.category_id = currentFilters.categoryId;
      if (currentFilters.startDate)
        params.start_date = currentFilters.startDate
          .toISOString()
          .split("T")[0];
      if (currentFilters.endDate)
        params.end_date = currentFilters.endDate.toISOString().split("T")[0];

      const data = await TransactionService.getAll(params); // Make sure Service accepts object

      // Laravel pagination structure: data, current_page, last_page
      const newTransactions = data.data;
      const currentPage = data.current_page;
      const lastPage = data.last_page;

      if (pageNum === 1) {
        setTransactions(newTransactions);
      } else {
        setTransactions((prev) => [...prev, ...newTransactions]);
      }

      setHasMore(currentPage < lastPage);
      setPage(pageNum);
    } catch (error) {
      console.log("Error loading transactions", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Reset to page 1
    loadTransactions(1, searchText, filters);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTransactions(page + 1, searchText, filters);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (searchTimer) clearTimeout(searchTimer);

    setSearchTimer(
      setTimeout(() => {
        loadTransactions(1, text, filters);
      }, 500),
    ); // Debounce 500ms
  };

  const openFilterModal = () => {
    setTempFilters(filters);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
    loadTransactions(1, searchText, tempFilters);
  };

  const resetFilters = () => {
    const resetState = { categoryId: null, startDate: null, endDate: null };
    setTempFilters(resetState);
    setFilters(resetState);
    setShowFilterModal(false);
    loadTransactions(1, searchText, resetState);
  };

  const onDateChange = (event, selectedDate, type) => {
    if (type === "start") {
      setShowStartDatePicker(Platform.OS === "ios");
      if (selectedDate)
        setTempFilters((prev) => ({ ...prev, startDate: selectedDate }));
    } else {
      setShowEndDatePicker(Platform.OS === "ios");
      if (selectedDate)
        setTempFilters((prev) => ({ ...prev, endDate: selectedDate }));
    }
  };

  const getIcon = (item) => {
    if (item.type === "expense") return "cart-outline";
    if (item.type === "income") return "wallet-outline";
    if (item.type.includes("loan")) return "swap-horizontal";
    return "help-circle-outline";
  };

  const getColor = (item) => {
    if (item.type === "expense") return "#EF4444";
    if (item.type === "income") return "#10B981";
    if (item.type.includes("loan")) return "#F59E0B";
    return "#6B7280";
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: getColor(item) + "20" }, // 20% opacity
        ]}
      >
        <Ionicons name={getIcon(item)} size={20} color={getColor(item)} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>
          {item.category?.name || item.title || "Transaction"}
        </Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          {
            color:
              item.type === "expense" || item.type === "loan_given"
                ? "#EF4444"
                : "#10B981",
          },
        ]}
      >
        {item.type === "expense" || item.type === "loan_given" ? "-" : "+"}
        Rs {item.amount}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            shadowColor: isDarkMode ? "#000" : "#000",
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={openFilterModal} style={{ marginLeft: 10 }}>
          <Ionicons
            name="filter"
            size={24}
            color={
              filters.categoryId || filters.startDate
                ? colors.primary
                : colors.textSecondary
            }
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              {
                backgroundColor: colors.card,
                shadowColor: isDarkMode ? "#000" : "#000",
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: getColor(item) + "20" },
              ]}
            >
              <Ionicons name={getIcon(item)} size={20} color={getColor(item)} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]}>
                {item.category?.name || item.title || "Transaction"}
              </Text>
              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    item.type === "expense" || item.type === "loan_given"
                      ? colors.danger
                      : colors.success,
                },
              ]}
            >
              {item.type === "expense" || item.type === "loan_given"
                ? "-"
                : "+"}
              Rs {item.amount}
            </Text>
          </View>
        )}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator style={{ margin: 20 }} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions found
            </Text>
          )
        }
      />
      {loading && page === 1 && (
        <View
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: isDarkMode
                ? "rgba(0,0,0,0.5)"
                : "rgba(255,255,255,0.8)",
            },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Filter Transactions
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>
                Date Range
              </Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: colors.border }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={{ color: colors.text }}>
                    {tempFilters.startDate
                      ? tempFilters.startDate.toLocaleDateString()
                      : "Start Date"}
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: colors.text }}>-</Text>
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: colors.border }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={{ color: colors.text }}>
                    {tempFilters.endDate
                      ? tempFilters.endDate.toLocaleDateString()
                      : "End Date"}
                  </Text>
                </TouchableOpacity>
              </View>
              {showStartDatePicker && (
                <DateTimePicker
                  value={tempFilters.startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, date) => onDateChange(e, date, "start")}
                  themeVariant={isDarkMode ? "dark" : "light"}
                />
              )}
              {showEndDatePicker && (
                <DateTimePicker
                  value={tempFilters.endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, date) => onDateChange(e, date, "end")}
                  themeVariant={isDarkMode ? "dark" : "light"}
                />
              )}

              <Text style={[styles.filterLabel, { color: colors.text }]}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !tempFilters.categoryId && styles.activeChip,
                    {
                      backgroundColor: !tempFilters.categoryId
                        ? colors.primary
                        : colors.inputBackground,
                    },
                  ]}
                  onPress={() =>
                    setTempFilters((prev) => ({ ...prev, categoryId: null }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      !tempFilters.categoryId && styles.activeChipText,
                      { color: !tempFilters.categoryId ? "#fff" : colors.text },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      tempFilters.categoryId === cat.id && styles.activeChip,
                      {
                        backgroundColor:
                          tempFilters.categoryId === cat.id
                            ? colors.primary
                            : colors.inputBackground,
                      },
                    ]}
                    onPress={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        categoryId: cat.id,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempFilters.categoryId === cat.id &&
                          styles.activeChipText,
                        {
                          color:
                            tempFilters.categoryId === cat.id
                              ? "#fff"
                              : colors.text,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  { backgroundColor: colors.inputBackground },
                ]}
                onPress={resetFilters}
              >
                <Text style={[styles.resetButtonText, { color: colors.text }]}>
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1F2937",
  },
  date: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 50,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    marginBottom: 0,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  categoryList: {
    flexDirection: "row",
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
  },
  activeChip: {
    backgroundColor: "#4F46E5",
  },
  chipText: {
    color: "#374151",
  },
  activeChipText: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#374151",
    fontWeight: "bold",
  },
  applyButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#4F46E5",
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
