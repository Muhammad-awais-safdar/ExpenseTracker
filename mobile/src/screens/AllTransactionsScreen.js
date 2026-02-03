import React, { useState, useEffect, useCallback } from "react";
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
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import TransactionService from "../services/transactionService";
import CategoryService from "../services/categoryService";
import { useTheme } from "../context/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";

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

  // Initial Load & Focus Refresh
  useFocusEffect(
    useCallback(() => {
      // If we want to auto-refresh when returning from details (e.g. after delete)
      loadTransactions(1, searchText, filters);
      loadCategories();
    }, []),
  );

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
    if (loading && pageNum > 1) return;
    if (pageNum === 1) setLoading(true);

    try {
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

      const data = await TransactionService.getAll(params);

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
    );
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
    if (item.category?.icon) return item.category.icon;
    if (item.type === "expense") return "cart-outline";
    if (item.type === "income") return "wallet-outline";
    if (item.type.includes("loan")) return "swap-horizontal";
    return "help-circle-outline";
  };

  const getColor = (item) => {
    if (item.category?.color) return item.category.color;
    if (item.type === "expense") return colors.danger;
    if (item.type === "income") return colors.success;
    if (item.type.includes("loan")) return colors.warning;
    return colors.textSecondary;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 20,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: 16,
      marginHorizontal: 20,
      marginTop: 12,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    info: {
      flex: 1,
    },
    title: {
      fontWeight: "bold",
      fontSize: 16,
      color: colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    date: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    amount: {
      fontWeight: "bold",
      fontSize: 16,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textSecondary,
      marginTop: 50,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      margin: 20,
      paddingHorizontal: 15,
      height: 50,
      borderRadius: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: "100%",
      fontSize: 16,
      color: colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 15,
      marginBottom: 10,
      color: colors.text,
    },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateButton: {
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      width: "47%",
      alignItems: "center",
    },
    categoryList: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      marginRight: 8,
      marginBottom: 8,
    },
    activeChip: {
      backgroundColor: colors.primary,
    },
    chipText: {
      color: colors.text,
      fontWeight: "500",
    },
    activeChipText: {
      color: "#fff",
      fontWeight: "bold",
    },
    modalFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 30,
    },
    resetButton: {
      padding: 16,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      flex: 1,
      marginRight: 10,
      alignItems: "center",
    },
    applyButton: {
      padding: 16,
      borderRadius: 14,
      backgroundColor: colors.primary,
      flex: 1,
      marginLeft: 10,
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colors.placeholder}
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
        <TouchableOpacity onPress={openFilterModal} style={{ marginLeft: 15 }}>
          <View style={{ position: "relative" }}>
            <Ionicons
              name="options-outline" // More modern filter icon
              size={24}
              color={
                filters.categoryId || filters.startDate
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            {(filters.categoryId || filters.startDate) && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.danger,
                  borderWidth: 1,
                  borderColor: colors.card,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("TransactionDetail", { transaction: item })
            }
          >
            <View style={styles.item}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: getColor(item) + "20" },
                ]}
              >
                <Ionicons
                  name={getIcon(item)}
                  size={24}
                  color={getColor(item)}
                />
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.category?.name ||
                    (item.type.includes("loan")
                      ? item.title
                      : item.type === "expense"
                        ? "Expense"
                        : "Income")}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.title || item.description || item.source} •{" "}
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
                {item.amount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `${item.type}-${item.id}`} // Simpler key
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
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              <Ionicons
                name="documents-outline"
                size={64}
                color={colors.border}
              />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          )
        }
      />
      {loading && page === 1 && (
        <View style={StyleSheet.absoluteFillObject}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text
                    style={{
                      color: tempFilters.startDate
                        ? colors.text
                        : colors.textSecondary,
                      fontWeight: tempFilters.startDate ? "600" : "normal",
                    }}
                  >
                    {tempFilters.startDate
                      ? tempFilters.startDate.toLocaleDateString()
                      : "Start Date"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textSecondary}
                    style={{ position: "absolute", right: 10 }}
                  />
                </TouchableOpacity>
                <Text style={{ color: colors.textSecondary }}>—</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text
                    style={{
                      color: tempFilters.endDate
                        ? colors.text
                        : colors.textSecondary,
                      fontWeight: tempFilters.endDate ? "600" : "normal",
                    }}
                  >
                    {tempFilters.endDate
                      ? tempFilters.endDate.toLocaleDateString()
                      : "End Date"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textSecondary}
                    style={{ position: "absolute", right: 10 }}
                  />
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

              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.categoryList}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !tempFilters.categoryId && styles.activeChip,
                  ]}
                  onPress={() =>
                    setTempFilters((prev) => ({ ...prev, categoryId: null }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      !tempFilters.categoryId && styles.activeChipText,
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
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={{ color: colors.text, fontWeight: "bold" }}>
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
