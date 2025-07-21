import { StyleSheet, Text, Image, View } from 'react-native'
import useThemedStyles from '../../hooks/useThemedStyles'
import useTheme from '../../hooks/useTheme'
import { Dimensions } from 'react-native'

// Font constants
const APP_FONT_BOLD = 'System-Bold';
const APP_FONT_REGULAR = 'System';

// Asset URL constant
const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';

const { width, height } = Dimensions.get('window');

interface CastCardProps {
    item: any;
    index: number;
    navigation: any;
}

const CastCard = ({ item, index, navigation }: CastCardProps) => {
    const { theme: { colors } } = useTheme()
    const style = useThemedStyles(styles)

    const { _id, name, image, realName, reelName, type } = item

    return (
        <View key={index} style={style.card}>
            <Image 
                style={style.img} 
                source={{ 
                    uri: `${NEXT_PUBLIC_ASSET_URL}/${realName?.image}` || 
                         `${NEXT_PUBLIC_ASSET_URL}/${image}` || 
                         'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
                }} 
            />
            <Text style={[style.heading, { textTransform: 'capitalize' }]}>
                {name || reelName}
            </Text>
            {type &&
                <Text style={style.txt}>
                    ({type})
                </Text>}
        </View>
    )
}

export default CastCard

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
    card: {
        marginVertical: width * .02,
        justifyContent: 'center',
        alignItems: 'center'
    },
    img: {
        resizeMode: 'cover',
        width: width * .12,
        height: width * .12,
        borderRadius: width * .12,
        backgroundColor: theme.colors.PRIMARYLIGHTGRAYTWO
    },
    heading: {
        flex: 1,
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_24,
        fontFamily: APP_FONT_BOLD,
        color: theme.colors.PRIMARYWHITE,
        flexWrap: 'wrap',
        marginTop: isLargeDevice ? width * .005 : width * .01,
        width: width * .22,
        textAlign: 'center'
    },
    txt: {
        flex: 1,
        fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_24,
        fontFamily: APP_FONT_REGULAR,
        color: theme.colors.PRIMARYGRAY,
        flexWrap: 'wrap',
        marginTop: isLargeDevice ? width * .005 : width * .01,
        width: width * .22,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
}) 