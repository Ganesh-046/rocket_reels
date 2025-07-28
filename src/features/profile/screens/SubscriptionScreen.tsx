import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { PressableButton } from '../../../components/Button';
import { SvgIcons } from '../../../components/common/SvgIcons';
import { ModalView } from '../../../components/common/ModalView';
import ActivityLoader from '../../../components/common/ActivityLoader';
import useThemedStyles from '../../../hooks/useThemedStyles';
import useTheme from '../../../hooks/useTheme';
import { useAuthUser } from '../../../store/auth.store';
import { useSubscriptionPlans, useActiveSubscription, usePurchaseSubscription } from '../../../hooks/useSubscription';

const SubscriptionScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthUser();
  const style = useThemedStyles(styles);

  // Device info - calculate directly
  const { width, height } = Dimensions.get('window');
  const isLargeDevice = width > 768;
  const columns = isLargeDevice ? 3 : 2;
  const appFonts = {
    APP_FONT_SIZE_3: 16,
    APP_FONT_SIZE_4: 18,
    APP_FONT_SIZE_5: 20,
    APP_FONT_SIZE_6: 24,
    APP_FONT_SIZE_7: 28,
    APP_FONT_SIZE_9: 12,
    APP_FONT_SIZE_16: 14,
    APP_FONT_SIZE_18: 16,
    APP_FONT_SIZE_20: 14,
    APP_FONT_SIZE_24: 18,
    APP_FONT_SIZE_28: 16,
    APP_FONT_SIZE_32: 14,
    APP_FONT_SIZE_35: 12,
  };

  // Subscription hooks
  const { data: subscriptionPlans, refetch: refetchPlans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: activeSubscription, refetch: refetchStatus, isLoading: statusLoading } = useActiveSubscription();
  const purchaseMutation = usePurchaseSubscription();

  const [isSelected, setIsSelected] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoized values for better performance
  const subscriptionData = useMemo(() => subscriptionPlans?.data || [], [subscriptionPlans]);
  const hasSubscriptionData = useMemo(() => subscriptionData.length > 0, [subscriptionData]);
  const isUserLoggedIn = useMemo(() => !!user, [user]);
  const hasActiveSub = activeSubscription?.data?.hasActive || false;
  const currentSubscription = activeSubscription?.data?.details || null;

  // Memoized subscription rows
  const subscriptionRows = useMemo(() => {
    if (!hasSubscriptionData) return [];
    return subscriptionData.reduce((rows: any[][], item: any, index: number) => {
      const cols = isLargeDevice ? 2 : 1;
      if (index % cols === 0) {
        rows.push([item]);
      } else {
        rows[rows.length - 1].push(item);
      }
      return rows;
    }, []);
  }, [isLargeDevice, hasSubscriptionData, subscriptionData]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPlans(),
        refetchStatus(),
      ]);
    } catch (error) {
      // Silent error handling
    } finally {
      setRefreshing(false);
    }
  }, [refetchPlans, refetchStatus]);

  // Buy subscription handler
  const handleBuySubscription = useCallback(async (item: any) => {
    if (hasActiveSub) {
      const subscriptionEndDate = currentSubscription?.subscriptionEndDate
        ? new Date(parseInt(currentSubscription.subscriptionEndDate)).toLocaleDateString()
        : 'Unknown';
      Alert.alert(
        'Active Subscription',
        `You already have an active subscription that expires on ${subscriptionEndDate}. You can manage your subscription through your device settings.`
      );
      return;
    }
    setIsProcessing(true);
    try {
      await purchaseMutation.mutateAsync({
        planId: item._id,
        transactionId: 'demo-txn-id',
        transactionReceipt: 'demo-txn-receipt',
        platform: 'android',
      });
      setIsSelected(null);
      await refetchStatus();
    } catch (error) {
      // Silent error handling
    } finally {
      setIsProcessing(false);
    }
  }, [hasActiveSub, currentSubscription, purchaseMutation, refetchStatus]);

  // Select subscription handler
  const handleSubscriptionSelect = useCallback((item: any) => {
    if (hasActiveSub && currentSubscription && currentSubscription.productId === item.planName) {
      Alert.alert(
        'Active Subscription',
        'You already have an active subscription to this plan. You can manage it through your device settings.'
      );
      return;
    }
    setIsSelected(item);
  }, [hasActiveSub, currentSubscription]);

  // Icon by description
  const getIconByDescription = useCallback((text: string) => {
    const color = theme.colors.PRIMARYBLACK || '#000';
    switch (text.toLowerCase()) {
      case 'unlimited viewing': 
        return <SvgIcons name={'unlimited'} color={color} size={isLargeDevice ? width * .04 : width * .07} />;
      case '1080p quality': 
        return <SvgIcons name={'hd'} color={color} size={isLargeDevice ? width * .04 : width * .07} />;
      case 'daily points reward':
      case 'daily point reward': 
        return <SvgIcons name={'daily-reward'} color={color} size={isLargeDevice ? width * .04 : width * .07} />;
      case 'ad-free': 
        return <SvgIcons name={'ads-free'} color={color} size={isLargeDevice ? width * .04 : width * .07} />;
      case 'members-only early access': 
        return <SvgIcons name={'member-only'} color={color} size={isLargeDevice ? width * .04 : width * .07} />;
      default: 
        return <SvgIcons name={'ads-free'} color={color} size={isLargeDevice ? width * .04 : width * .07} />;
    }
  }, [theme.colors.PRIMARYBLACK, isLargeDevice, width]);

  // Render subscription item
  const renderSubscriptionItem = useCallback((item: any, index: number, rowIndex: number) => (
    <PressableButton
      onPress={() => handleSubscriptionSelect(item)}
      style={{
        padding: isLargeDevice ? width * .01 : width * .02,
        borderRadius: width * .01,
        width: isLargeDevice ? width * .5 : width * .98
      }}
      key={`${rowIndex}-${index}-${item.planName}`}
    >
      <LinearGradient 
        colors={["#A07A64", "#5E4536"]} 
        style={[
          style.planGradient, 
          { 
            borderTopRightRadius: width * .01, 
            borderTopLeftRadius: width * .01, 
            opacity: isProcessing ? 0.7 : 1 
          }
        ]}
      > 
        <View style={[
          style.directionContainer, 
          { 
            alignItems: 'flex-start', 
            padding: isLargeDevice ? width * .01 : width * .02 
          }
        ]}> 
          <Image 
            style={style.VIPimg} 
            source={{ 
              uri: 'data:image/png;base64,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' 
            }} 
          />
          <View style={[
            style.directionContainer, 
            { 
              alignItems: 'flex-end', 
              justifyContent: 'flex-end' 
            }
          ]}> 
            <Text style={[
              style.heading, 
              { 
                fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_5 : appFonts.APP_FONT_SIZE_7 
              }
            ]}> 
              {item?.planDuration || '7'} 
            </Text>
            <Text style={style.heading}> Days </Text>
          </View>
        </View>
        <View style={style.detailContainer}>
          <Text 
            numberOfLines={1} 
            ellipsizeMode="tail" 
            style={[
              style.heading, 
              { 
                textTransform: 'capitalize', 
                fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_28 : appFonts.APP_FONT_SIZE_35 
              }
            ]}
          > 
            {item?.planName?.split("_")[0]} 
          </Text>
          <Text 
            numberOfLines={2} 
            ellipsizeMode="tail" 
            style={[
              style.txt, 
              { 
                marginTop: isLargeDevice ? width * .01 : width * .015, 
                color: theme.colors.PRIMARYWHITE 
              }
            ]}
          > 
            {Array.isArray(item?.description) ? item.description.join(', ') : item?.description} 
          </Text>
        </View>
      </LinearGradient>
      <View style={[
        item?.discountPrice && style.directionContainer, 
        { justifyContent: 'center' }, 
        { 
          padding: isLargeDevice ? width * .01 : width * .03, 
          shadowColor: theme.colors.PRIMARYBLACK, 
          shadowOffset: { width: 0, height: 4 }, 
          shadowOpacity: 0.6, 
          borderBottomRightRadius: width * .01, 
          borderBottomLeftRadius: width * .01, 
          backgroundColor: theme.colors.PRIMARYWHITEFOUR 
        }
      ]}> 
        <Text style={[
          style.heading, 
          { 
            textDecorationLine: 'line-through', 
            fontSize: isLargeDevice ? 
              (item?.discountPrice ? appFonts.APP_FONT_SIZE_28 : appFonts.APP_FONT_SIZE_3) : 
              (item?.discountPrice ? appFonts.APP_FONT_SIZE_35 : appFonts.APP_FONT_SIZE_5), 
            textAlign: 'center', 
            color: item?.discountPrice ? theme.colors.PRIMARYWHITEFOUR : theme.colors.PRIMARYWHITE 
          }
        ]}> 
          {item?.price} {' '} 
        </Text>
        {item?.discountPrice && (
          <Text style={[
            style.heading, 
            { 
              fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_3 : appFonts.APP_FONT_SIZE_5, 
              textAlign: 'center' 
            }
          ]}> 
            {item?.discountPrice} 
          </Text>
        )}
      </View>
    </PressableButton>
  ), [isLargeDevice, width, appFonts, theme.colors, style, isProcessing, handleSubscriptionSelect]);

  // Tips
  const tips = [
    'Rocket Reels features both free and paid content for everyone.',
    'Paid content can be unlocked using coins or by subscribing to a membership. Membership-only content can only be accessed after subscribing to a membership.',
    'Both the coins and the reward coins will never expire.',
    'Coins will be used first when unlocking episodes. If the amount is insufficient, reward coins will automatically be used.',
    'During the subscription period, you will have unlimited access to all content in Rocket Reels.',
  ];

  // Processing overlay timeout (30s)
  useEffect(() => {
    if (isProcessing) {
      const timeout = setTimeout(() => {
        if (isProcessing) setIsProcessing(false);
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [isProcessing]);

  // Loading state
  if ((plansLoading || statusLoading) && !refreshing) {
    return (
      <LinearGradient colors={['#ed9b72', '#7d2537']} style={[style.gradient, { paddingTop: insets.top }]}> 
        <View style={style.header}> 
          <PressableButton onPress={() => navigation.goBack()} style={style.backButton}> 
            <SvgIcons name={'arrowBack'} color={theme.colors.PRIMARYWHITE} size={24} /> 
          </PressableButton>
          <Text style={style.heading}>Subscription</Text>
        </View>
        <View style={style.loadingContainer}> 
          <ActivityLoader loaderColor={theme.colors.PRIMARYWHITE} /> 
          <Text style={style.loadingText}>Loading subscription plans...</Text> 
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#ed9b72', '#7d2537']} style={[style.gradient, { paddingTop: insets.top }]}> 
      <View style={style.header}> 
        <PressableButton onPress={() => navigation.goBack()} style={style.backButton}> 
          <SvgIcons name={'arrowBack'} color={theme.colors.PRIMARYWHITE} size={24} /> 
        </PressableButton>
        <Text style={style.heading}>Subscription</Text>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.colors.PRIMARYWHITE]} 
          />
        }
      > 
        <View style={style.container}>
          {isProcessing && (
            <View style={style.processingOverlay}> 
              <ActivityLoader loaderColor={theme.colors.PRIMARYWHITE} /> 
              <Text style={style.processingText}>Processing your request...</Text> 
            </View>
          )}
          {subscriptionRows.map((row: any[], rowIndex: number) => (
            <View 
              key={rowIndex} 
              style={[
                style.directionContainer, 
                { justifyContent: 'flex-start', flex: 0 }
              ]}
            > 
              {row.map((item: any, index: number) => renderSubscriptionItem(item, index, rowIndex))} 
            </View>
          ))}
          <View style={[
            style.directionContainer, 
            { 
              justifyContent: 'center', 
              marginVertical: isLargeDevice ? width * .015 : width * .03 
            }
          ]}> 
            <PressableButton 
              onPress={() => { 
                setIsSelected(''); 
                navigation.navigate('WebView', { 
                  title: 'Terms of use (EULA)', 
                  url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' 
                }) 
              }}
            > 
              <Text style={[
                style.heading, 
                { 
                  textDecorationLine: 'underline', 
                  fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28, 
                  color: theme.colors.PRIMARYWHITEFOUR 
                }
              ]}> 
                Terms of use (EULA) 
              </Text> 
            </PressableButton>
            <Text style={[
              style.txt, 
              { 
                fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28, 
                color: theme.colors.PRIMARYWHITEFOUR 
              }
            ]}> 
              {' '} and {' '} 
            </Text>
            <PressableButton 
              onPress={() => { 
                setIsSelected(''); 
                navigation.navigate('WebView', { 
                  title: 'Privacy Policy', 
                  url: 'https://rocketreels.co.in/privacy-policy/' 
                }) 
              }}
            > 
              <Text style={[
                style.heading, 
                { 
                  textDecorationLine: 'underline', 
                  fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28, 
                  color: theme.colors.PRIMARYWHITEFOUR 
                }
              ]}> 
                Privacy policy 
              </Text> 
            </PressableButton>
          </View>
        </View>
      </ScrollView>
      {isSelected && (
        <ModalView 
          bottomBox={{ marginBottom: 0 }} 
          heading={`${isSelected?.planName?.split('_')[0]} Subscription` || ''} 
          onRequestClose={() => setIsSelected(null)}
        >
          <View style={style.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <LinearGradient 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                colors={["#A07A64", "#5E4536"]} 
                style={[
                  style.directionContainer, 
                  { 
                    alignItems: 'flex-start', 
                    borderTopLeftRadius: width * .01, 
                    borderTopRightRadius: width * .01, 
                    padding: isLargeDevice ? width * .015 : width * .03 
                  }
                ]}
              > 
                <View>
                  <Text style={[
                    style.heading, 
                    { 
                      textTransform: 'capitalize', 
                      fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_3 : appFonts.APP_FONT_SIZE_5 
                    }
                  ]}> 
                    {isSelected.planName.split('_')[0]} 
                  </Text>
                  <Text style={style.heading}> {isSelected.planDuration} Days </Text>
                </View>
                <View style={[
                  style.directionContainer, 
                  { justifyContent: 'flex-end', alignItems: 'flex-end' }
                ]}> 
                  <Text style={[
                    style.heading, 
                    { 
                      fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_4 
                    }
                  ]}> 
                    ₹ 
                  </Text>
                  <Text style={[
                    style.heading, 
                    { 
                      marginLeft: width * .01, 
                      fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_4 : appFonts.APP_FONT_SIZE_6 
                    }
                  ]}> 
                    {isSelected.discountPrice || isSelected.price} 
                  </Text>
                </View>
              </LinearGradient>
              <View style={{ 
                padding: isLargeDevice ? width * .015 : width * .03, 
                paddingVertical: isLargeDevice ? width * .025 : width * .05 
              }}>
                {Array.isArray(isSelected.description) && 
                  isSelected.description.reduce((rows: any[][], item: string, index: number) => {
                    const cols = isLargeDevice ? 3 : 2;
                    if (index % cols === 0) {
                      rows.push([item]);
                    } else {
                      rows[rows.length - 1].push(item);
                    }
                    return rows;
                  }, []).map((row: any[], rowIndex: number) => (
                    <View 
                      key={rowIndex} 
                      style={[
                        style.directionContainer, 
                        { justifyContent: 'flex-start', flex: 0 }
                      ]}
                    > 
                      {row.map((item: string, index: number) => (
                        <View 
                          key={index} 
                          style={[{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            padding: isLargeDevice ? width * .01 : width * .02 
                          }]}
                        > 
                          {getIconByDescription(item)} 
                          <Text style={[
                            style.txt, 
                            { 
                              marginTop: isLargeDevice ? width * .01 : width * .02, 
                              color: theme.colors.PRIMARYBLACK 
                            }
                          ]}> 
                            {item} 
                          </Text> 
                        </View>
                      ))} 
                    </View>
                  ))
                }
                <View style={style.tipsContainer}> 
                  <Text style={[
                    style.heading, 
                    { 
                      marginBottom: isLargeDevice ? width * .01 : width * .02, 
                      color: theme.colors.PRIMARYLIGHTBLACKONE 
                    }
                  ]}>
                    Tips
                  </Text> 
                  {tips.map((tip, index) => (
                    <View 
                      key={index} 
                      style={[
                        style.directionContainer, 
                        { 
                          justifyContent: 'flex-start', 
                          marginVertical: width * .006, 
                          alignItems: 'flex-start', 
                          marginLeft: isLargeDevice ? width * .01 : width * .02 
                        }
                      ]}
                    > 
                      <Text style={[
                        style.txt, 
                        { 
                          fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_32, 
                          color: theme.colors.PRIMARYBLACK 
                        }
                      ]}> 
                        {index + 1}. 
                      </Text> 
                      <Text style={[
                        style.txt, 
                        { 
                          marginLeft: isLargeDevice ? width * .001 : width * .01, 
                          fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_32, 
                          color: theme.colors.PRIMARYBLACK 
                        }
                      ]}> 
                        {tip} 
                      </Text> 
                    </View>
                  ))} 
                </View>
                <View style={[
                  style.directionContainer, 
                  { 
                    marginVertical: isLargeDevice ? width * .01 : width * .02, 
                    justifyContent: 'center', 
                    flex: 0, 
                    flexWrap: 'wrap' 
                  }
                ]}> 
                  <Text style={style.txt}> 
                    By continuing, you agree to our {' '} 
                  </Text> 
                  <PressableButton 
                    onPress={() => { 
                      setIsSelected(''); 
                      navigation.navigate('WebView', { 
                        title: 'Terms of use (EULA)', 
                        url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' 
                      }) 
                    }}
                  > 
                    <Text style={[
                      style.heading, 
                      { 
                        textDecorationLine: 'underline', 
                        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28, 
                        color: theme.colors.PRIMARYBLACK 
                      }
                    ]}> 
                      Terms of use (EULA) 
                    </Text> 
                  </PressableButton> 
                  <Text style={style.txt}> {' '} and {' '} </Text> 
                  <PressableButton 
                    onPress={() => { 
                      setIsSelected(''); 
                      navigation.navigate('WebView', { 
                        title: 'Privacy Policy', 
                        url: 'https://rocketreels.co.in/privacy-policy' 
                      }) 
                    }}
                  > 
                    <Text style={[
                      style.heading, 
                      { 
                        textDecorationLine: 'underline', 
                        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28, 
                        color: theme.colors.PRIMARYBLACK 
                      }
                    ]}> 
                      Privacy policy 
                    </Text> 
                  </PressableButton> 
                </View>
                <PressableButton
                  style={{
                    width: 'auto',
                    alignSelf: 'center',
                    marginTop: isLargeDevice ? width * .015 : width * .03,
                    opacity: currentSubscription ? 0.6 : 1
                  }}
                  onPress={() => !currentSubscription && !isProcessing ? handleBuySubscription(isSelected) : null}
                  disabled={currentSubscription || isProcessing}
                >
                  <LinearGradient 
                    colors={currentSubscription ? ['#cccccc', '#999999'] : ['#E9743A', '#CB2D4D']} 
                    style={{ paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 }}
                  >
                    <Text style={{ 
                      color: theme.colors.PRIMARYWHITE, 
                      fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_18, 
                      fontWeight: '700', 
                      textAlign: 'center' 
                    }}>
                      {currentSubscription ? 'Already Subscribed' : 'SUBSCRIBE NOW'}
                    </Text>
                  </LinearGradient>
                </PressableButton>
              </View>
            </ScrollView>
          </View>
        </ModalView>
      )}
      {/* Debug/Dev Buttons */}
      {__DEV__ && (
        <View style={{ 
          marginHorizontal: isLargeDevice ? width * .02 : width * .04, 
          marginBottom: isLargeDevice ? width * .01 : width * .02 
        }}>
          <Text style={{ 
            color: theme.colors.PRIMARYWHITE, 
            fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_24, 
            fontWeight: 'bold', 
            marginBottom: isLargeDevice ? width * .005 : width * .01 
          }}>
            🧪 Auto-Renewable Subscription Tests
          </Text>
          {/* Add your debug/dev test buttons here as needed */}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
    marginTop: isLargeDevice ? width * .015 : width * .03
  },
  gradient: {
    flex: 1,
    paddingHorizontal: isLargeDevice ? width * .005 : width * .01,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: isLargeDevice ? width * .015 : 0,
    marginBottom: width * .01
  },
  heading: {
    fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_20 : appFonts.APP_FONT_SIZE_35,
    fontWeight: 'bold',
    color: theme.colors.PRIMARYWHITE
  },
  txt: {
    fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28,
    color: theme.colors.PRIMARYGRAY,
  },
  backButton: {
    marginRight: isLargeDevice ? width * .005 : width * .01,
  },
  planGradient: {
    padding: isLargeDevice ? width * .04 : width * .05,
  },
  directionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  VIPimg: {
    borderRadius: 999,
    width: isLargeDevice ? width * .06 : width * .1,
    height: isLargeDevice ? width * .06 : width * .1,
    resizeMode: 'contain',
    tintColor: theme.colors.PRIMARYWHITEFOUR
  },
  detailContainer: {
    flex: 1,
    padding: isLargeDevice ? width * .01 : width * .02,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContainer: {
    margin: isLargeDevice ? width * .1 : width * .04,
    marginHorizontal: isLargeDevice ? width * .2 : width * .04,
    borderRadius: width * .01,
    justifyContent: 'center',
    backgroundColor: '#EBE2DA'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.PRIMARYWHITE,
    fontSize: 16,
    marginTop: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  processingText: {
    color: theme.colors.PRIMARYWHITE,
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold'
  },
  tipsContainer: {
    paddingHorizontal: isLargeDevice ? width * .015 : 20,
    marginBottom: isLargeDevice ? width * .015 : 30,
  },
});

export default SubscriptionScreen; 