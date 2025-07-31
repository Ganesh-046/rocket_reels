import { FlatList, Keyboard, View, ActivityIndicator, Text, Animated, TouchableOpacity, StyleSheet, ListRenderItem } from 'react-native'
import React, { useContext, useState, useCallback, useRef, useEffect } from 'react'
import SearchBar from '../components/common/SearchBar'
import MovieCard from '../components/Cards/MovieCard'
import { useContentContext } from '../context/ContentContext'
import { useGenreContext } from '../context/GenreContext'
import WithoutNativeButton from '../components/common/WithoutNativeButton'
import LinearGradientView from '../components/common/LinearGradientView'
import { useTheme } from '../hooks/useTheme'
import useThemedStyles from '../hooks/useThemedStyles'
import { SvgIcons } from '../components/common/SvgIcons'
import { useDeviceContext } from '../context/DeviceContext'

// Type definitions
interface NavigationProp {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
}

interface SearchScreenProps {
    navigation: NavigationProp;
}

interface ContentItem {
    _id: string;
    title: string;
    type?: string;
    language?: string;
    genre?: string;
    imageUri?: string;
    backdropImage?: string;
    rating?: number;
    year?: number;
    description?: string;
}

interface EmptyStateContent {
    icon: string;
    title: string;
    subtitle: string;
    showRetry: boolean;
    suggestions?: string[];
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
    const { isAdult, contentData, onGetContentData, pages } = useContentContext()
    const { genreData } = useGenreContext()
    const { isLargeDevice, dimension: { width, height: screenHeight }, appFonts } = useDeviceContext()
    const { theme } = useTheme()
    const style = useThemedStyles(styles)

    const [searchval, setSearchValue] = useState<string>('')
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>('')
    const [searchError, setSearchError] = useState<string | null>(null)
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false)

    // Animation values
    const searchResultsAnim = useRef(new Animated.Value(0)).current
    const searchResultsTranslateY = useRef(new Animated.Value(20)).current

    // Debounce timer ref
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Debounce delay in milliseconds - reduced for better responsiveness
    const DEBOUNCE_DELAY: number = 300

    // Animate search results when they change
    useEffect(() => {
        if (contentData?.allContentData && contentData.allContentData.length > 0) {
            Animated.parallel([
                Animated.timing(searchResultsAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(searchResultsTranslateY, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]).start()
        } else {
            // Reset animation using timing to avoid native driver conflicts
            Animated.parallel([
                Animated.timing(searchResultsAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(searchResultsTranslateY, {
                    toValue: 20,
                    duration: 0,
                    useNativeDriver: true,
                })
            ]).start()
        }
    }, [contentData?.allContentData, searchResultsAnim, searchResultsTranslateY])

    // Enhanced debounced search function with better error handling
    const debouncedSearch = useCallback(async (searchText: string): Promise<void> => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(async () => {
            if (searchText.trim()) {
                setIsSearching(true)
                setSearchError(null)
                
                try {
                    await onGetContentData(
                        isAdult,
                        searchText.trim(),
                        '', // type
                        '', // language
                        '', // genre
                        '', // trgtAud
                        1,
                        30
                    )
                } catch (error) {
                    console.log('Search error:', error)
                    setSearchError('Failed to search. Please try again.')
                } finally {
                    setIsSearching(false)
                }
            } else {
                // Clear results if search is empty
                setIsSearching(false)
                setSearchError(null)
            }
            setDebouncedSearchValue(searchText)
        }, DEBOUNCE_DELAY)
    }, [isAdult, onGetContentData])

    // Handle search input changes with immediate feedback
    const onSearchMovies = useCallback((txt: string): void => {
        setSearchValue(txt)
        setSearchError(null) // Clear any previous errors
        debouncedSearch(txt)
    }, [debouncedSearch])

    // Handle search focus/blur
    const handleSearchFocus = useCallback((): void => {
        setIsSearchFocused(true)
    }, [])

    const handleSearchBlur = useCallback((): void => {
        setIsSearchFocused(false)
    }, [])

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
            
            // Clear search results to free memory
            setSearchValue('');
            setDebouncedSearchValue('');
            setSearchError(null);
            setIsSearching(false);
            setIsSearchFocused(false);
        }
    }, [])

    // Optimized render item function
    const renderItem: ListRenderItem<ContentItem> = useCallback(({ item, index }) => (
        <MovieCard key={item._id || index} item={item} index={index} navigation={navigation} />
    ), [navigation])

    // Optimized key extractor
    const keyExtractor = useCallback((item: ContentItem, index: number): string =>
        item?._id?.toString() || index.toString(),
        [])

    // Enhanced loading component
    const LoadingComponent: React.FC = () => (
        <View style={style.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.PRIMARYWHITE} />
            <Text style={style.loadingText}>
                {searchval ? `Searching for "${searchval}"...` : 'Searching for shows...'}
            </Text>
        </View>
    )

    // Enhanced empty component
    const EmptyComponent: React.FC = () => {
        
        const getEmptyStateContent = (): EmptyStateContent => {
            if (searchError) {
                return {
                    icon: 'search',
                    title: 'Search Error',
                    subtitle: searchError,
                    showRetry: true
                }
            }
            
            if (searchval.trim()) {
                return {
                    icon: 'search',
                    title: `No shows found for "${searchval}"`,
                    subtitle: 'Try searching with different keywords, check spelling, or browse our popular categories below',
                    showRetry: false,
                    suggestions: [
                        'Try shorter keywords',
                        'Check for typos',
                        'Use different terms',
                        'Browse by genre'
                    ]
                }
            }
            
            return {
                icon: 'search',
                title: 'Discover Amazing Shows',
                subtitle: 'Search for your favorite shows, movies, or explore new content by typing in the search bar above',
                showRetry: false
            }
        }

        const content: EmptyStateContent = getEmptyStateContent()

        return (
            <View style={style.emptyContainer}>
                <SvgIcons name={content.icon} size={width * 0.15} color={theme.colors.PRIMARYWHITE} />
                <Text style={style.emptyTitle}>
                    {content.title}
                </Text>
                <Text style={style.emptySubtitle}>
                    {content.subtitle}
                </Text>
                
                {content.suggestions && (
                    <View style={style.suggestionsContainer}>
                        <Text style={style.suggestionsTitle}>Suggestions:</Text>
                        {content.suggestions.map((suggestion: string, index: number) => (
                            <Text key={index} style={style.suggestionText}>
                                • {suggestion}
                            </Text>
                        ))}
                    </View>
                )}
                
                {content.showRetry && (
                    <TouchableOpacity 
                        style={style.retryButton}
                        onPress={() => debouncedSearch(searchval)}
                        activeOpacity={0.7}
                    >
                        <Text style={style.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    const handleEndReached = useCallback((): void => {
        if (contentData?.allContentData && contentData.allContentData.length > 0 && !isSearching && !searchError) {
            onGetContentData(
                isAdult,
                debouncedSearchValue,
                '', // type
                '', // language
                '', // genre
                '', // trgtAud
                pages + 1,
                30
            )
        }
    }, [contentData?.allContentData?.length, isSearching, searchError, onGetContentData, isAdult, debouncedSearchValue, pages])

    return (
        <LinearGradientView start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={['#ed9b72', '#7d2537']}>
            <View style={style.container}>
                <SearchBar
                    placeholder={'Search shows...'}
                    setValue={onSearchMovies}
                    value={searchval}
                    navigation={navigation}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                />

                <WithoutNativeButton onPress={() => Keyboard.dismiss()}>
                    <View style={style.contentContainer}>
                        <Animated.View 
                            style={[
                                style.resultsContainer,
                                {
                                    opacity: searchResultsAnim,
                                    transform: [{
                                        translateY: searchResultsTranslateY
                                    }]
                                }
                            ]}
                        >
                            {isSearching ? (
                                <LoadingComponent />
                            ) : (!contentData?.allContentData || contentData.allContentData.length === 0) ? (
                                <EmptyComponent />
                            ) : (
                                <FlatList<ContentItem>
                                    key={3}
                                    data={contentData.allContentData}
                                    numColumns={3}
                                    renderItem={renderItem}
                                    keyExtractor={keyExtractor}
                                    showsVerticalScrollIndicator={false}
                                    removeClippedSubviews={true}
                                    maxToRenderPerBatch={10}
                                    windowSize={10}
                                    initialNumToRender={6}
                                    getItemLayout={(data, index) => ({
                                        length: 200,
                                        offset: 200 * Math.floor(index / 3),
                                        index,
                                    })}
                                    onEndReachedThreshold={0.5}
                                    onEndReached={handleEndReached}
                                    contentContainerStyle={style.listContainer}
                                    ListHeaderComponent={
                                        searchval.length > 0 ? (
                                            <View style={style.resultsHeader}>
                                                <Text style={style.resultsTitle}>
                                                    {isSearching ? 'Searching...' : `Results for "${searchval}"`}
                                                </Text>
                                                <Text style={style.resultsCount}>
                                                    {contentData.allContentData.length} {contentData.allContentData.length === 1 ? 'result' : 'results'}
                                                </Text>
                                            </View>
                                        ) : null
                                    }
                                />
                            )}
                        </Animated.View>
                    </View>
                </WithoutNativeButton>
            </View>
        </LinearGradientView>
    )
}

export default SearchScreen

interface StylesProps {
    theme: any;
    isLargeDevice: boolean;
    width: number;
    height: number;
    columns: number;
    appFonts: any;
}

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1
    },
    resultsContainer: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: height * 0.1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: height * 0.2,
    },
    loadingText: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_18,
        fontFamily: 'System',
        color: theme.colors.PRIMARYWHITE,
        marginTop: width * 0.03,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.1,
        paddingVertical: height * 0.2,
    },
    emptyTitle: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_20 : appFonts.APP_FONT_SIZE_24,
        fontFamily: 'System-Bold',
        color: theme.colors.PRIMARYWHITE,
        textAlign: 'center',
        marginTop: width * 0.04,
        marginBottom: width * 0.02,
    },
    emptySubtitle: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_14 : appFonts.APP_FONT_SIZE_16,
        fontFamily: 'System',
        color: theme.colors.PRIMARYWHITE,
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: isLargeDevice ? width * 0.04 : width * 0.05,
        marginBottom: width * 0.04,
    },
    retryButton: {
        backgroundColor: theme.colors.PRIMARYWHITE + '20',
        paddingHorizontal: width * 0.06,
        paddingVertical: width * 0.03,
        borderRadius: width * 0.06,
        borderWidth: 1,
        borderColor: theme.colors.PRIMARYWHITE + '40',
    },
    retryButtonText: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_14 : appFonts.APP_FONT_SIZE_16,
        fontFamily: 'System',
        color: theme.colors.PRIMARYWHITE,
        textAlign: 'center',
    },
    suggestionsContainer: {
        paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
        paddingVertical: width * 0.03,
    },
    suggestionsTitle: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_22,
        fontFamily: 'System-Bold',
        color: theme.colors.PRIMARYWHITE,
        marginBottom: width * 0.03,
        textAlign: 'center',
    },
    suggestionsLoadingContainer: {
        alignItems: 'center',
        paddingVertical: width * 0.04,
    },
    suggestionsLoadingText: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_18,
        fontFamily: 'System',
        color: theme.colors.PRIMARYWHITE,
        marginTop: width * 0.02,
        textAlign: 'center',
        opacity: 0.8,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: width * 0.02,
    },
    suggestionChip: {
        backgroundColor: theme.colors.PRIMARYWHITE + '20',
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.02,
        borderRadius: width * 0.06,
        borderWidth: 1,
        borderColor: theme.colors.PRIMARYWHITE + '40',
        marginBottom: width * 0.02,
    },
    suggestionText: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_14 : appFonts.APP_FONT_SIZE_16,
        fontFamily: 'System',
        color: theme.colors.PRIMARYWHITE,
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: width * 0.01,
        lineHeight: isLargeDevice ? width * 0.04 : width * 0.05,
    },
    resultsHeader: {
        marginBottom: width * 0.05,
        paddingHorizontal: width * 0.05,
    },
    resultsTitle: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_20,
        fontFamily: 'System-Bold',
        color: theme.colors.PRIMARYWHITE,
        marginBottom: width * 0.01,
    },
    resultsCount: {
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_14 : appFonts.APP_FONT_SIZE_16,
        fontFamily: 'System',
        color: theme.colors.PRIMARYWHITE,
        opacity: 0.8,
    },
}) 