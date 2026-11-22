<?php
/**
 * Plugin Name: CafeMenu SaaS - پلتفرم منوی دیجیتال و اشتراک کافه و رستوران
 * Plugin URI: https://cafemenu.ir
 * Description: پلتفرم کامل ساخت منوی دیجیتال QR کد، پنل مدیریت اختصاصی کافه‌داران، منوساز بصری و اتصال به اشتراک‌های ماهانه و سالانه ووکامرس.
 * Version: 1.0.0
 * Author: CafeMenu Platform
 * Text Domain: cafemenu-saas
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class CafeMenu_SaaS_Platform {

    const OPTION_SETTINGS = 'cafemenu_saas_wp_settings';
    const USER_META_CAFE  = 'cafemenu_user_cafe_state';
    const USER_META_PLAN  = 'cafemenu_user_subscription';

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
        add_action( 'woocommerce_order_status_completed', array( $this, 'handle_woocommerce_subscription' ), 10, 1 );

        add_shortcode( 'cafemenu_platform', array( $this, 'render_platform_shortcode' ) );
        add_shortcode( 'cafemenu_digital', array( $this, 'render_digital_menu_shortcode' ) );
    }

    /**
     * منوی تنظیمات در پیشخوان وردپرس
     */
    public function register_admin_menu() {
        add_menu_page(
            'تنظیمات پلتفرم CafeMenu',
            'منوساز CafeMenu',
            'manage_options',
            'cafemenu-saas',
            array( $this, 'render_admin_page' ),
            'dashicons-coffee',
            26
        );
    }

    public function register_settings() {
        register_setting( 'cafemenu_saas_group', self::OPTION_SETTINGS, array(
            'sanitize_callback' => array( $this, 'sanitize_admin_settings' ),
        ) );
    }

    public function sanitize_admin_settings( $input ) {
        return array(
            'app_url'              => isset( $input['app_url'] ) ? esc_url_raw( $input['app_url'] ) : '',
            'pro_monthly_id'       => isset( $input['pro_monthly_id'] ) ? absint( $input['pro_monthly_id'] ) : 0,
            'pro_yearly_id'        => isset( $input['pro_yearly_id'] ) ? absint( $input['pro_yearly_id'] ) : 0,
            'enterprise_monthly_id'=> isset( $input['enterprise_monthly_id'] ) ? absint( $input['enterprise_monthly_id'] ) : 0,
            'enterprise_yearly_id' => isset( $input['enterprise_yearly_id'] ) ? absint( $input['enterprise_yearly_id'] ) : 0,
        );
    }

    public function render_admin_page() {
        $opts = get_option( self::OPTION_SETTINGS, array() );
        $has_local_dist = file_exists( plugin_dir_path( __FILE__ ) . 'dist/index.html' );
        ?>
        <div class="wrap" dir="rtl">
            <h1>پلتفرم منوساز دیجیتال کافه و رستوران (CafeMenu SaaS)</h1>
            <p>برای اتصال اشتراک‌های ماهانه و سالانه به ووکامرس و نمایش پلتفرم در صفحات سایت، تنظیمات زیر را وارد کنید.</p>

            <div style="background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:16px;margin:16px 0;max-width:780px;">
                <h2 style="margin-top:0;">وضعیت فایل‌های بیلد (React App)</h2>
                <?php if ( $has_local_dist ) : ?>
                    <p style="color:#0a7d32;font-weight:bold;">پوشه <code>dist/</code> شناسایی شد و شورت‌کد <code>[cafemenu_platform]</code> مستقیماً از فایل‌های محلی اجرا می‌شود.</p>
                <?php else : ?>
                    <p style="color:#b45309;">پوشه <code>dist/</code> در کنار این فایل یافت نشد. می‌توانید پس از اجرای <code>npm run build</code> پوشه <code>dist</code> را در مسیر <code><?php echo esc_html( plugin_dir_path( __FILE__ ) ); ?></code> آپلود کنید یا آدرس اپلیکیشن میزبانی‌شده را در کادر زیر وارد نمایید.</p>
                <?php endif; ?>

                <p><strong>شورت‌کدهای آماده:</strong></p>
                <ul>
                    <li>نمایش کل پلتفرم و پنل مدیریت کاربران: <code>[cafemenu_platform]</code></li>
                    <li>نمایش منوی یک کافه خاص: <code>[cafemenu_digital slug="roka-cafe"]</code></li>
                </ul>
            </div>

            <form method="post" action="options.php" style="max-width:780px;">
                <?php settings_fields( 'cafemenu_saas_group' ); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="cafemenu_app_url">آدرس وب‌اپلیکیشن (اختیاری در صورت نبود dist)</label></th>
                        <td>
                            <input name="<?php echo esc_attr( self::OPTION_SETTINGS ); ?>[app_url]" id="cafemenu_app_url" type="url" dir="ltr" value="<?php echo esc_attr( $opts['app_url'] ?? '' ); ?>" class="regular-text" placeholder="https://menu.yoursite.ir" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="pro_monthly_id">شناسه محصول ووکامرس - پلن حرفه‌ای (ماهانه)</label></th>
                        <td><input name="<?php echo esc_attr( self::OPTION_SETTINGS ); ?>[pro_monthly_id]" id="pro_monthly_id" type="number" value="<?php echo esc_attr( $opts['pro_monthly_id'] ?? 0 ); ?>" class="small-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="pro_yearly_id">شناسه محصول ووکامرس - پلن حرفه‌ای (سالانه)</label></th>
                        <td><input name="<?php echo esc_attr( self::OPTION_SETTINGS ); ?>[pro_yearly_id]" id="pro_yearly_id" type="number" value="<?php echo esc_attr( $opts['pro_yearly_id'] ?? 0 ); ?>" class="small-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="enterprise_monthly_id">شناسه محصول ووکامرس - پلن زنجیره‌ای (ماهانه)</label></th>
                        <td><input name="<?php echo esc_attr( self::OPTION_SETTINGS ); ?>[enterprise_monthly_id]" id="enterprise_monthly_id" type="number" value="<?php echo esc_attr( $opts['enterprise_monthly_id'] ?? 0 ); ?>" class="small-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="enterprise_yearly_id">شناسه محصول ووکامرس - پلن زنجیره‌ای (سالانه)</label></th>
                        <td><input name="<?php echo esc_attr( self::OPTION_SETTINGS ); ?>[enterprise_yearly_id]" id="enterprise_yearly_id" type="number" value="<?php echo esc_attr( $opts['enterprise_yearly_id'] ?? 0 ); ?>" class="small-text" /></td>
                    </tr>
                </table>
                <?php submit_button( 'ذخیره تنظیمات پلتفرم' ); ?>
            </form>
        </div>
        <?php
    }

    /**
     * ثبت مسیرهای REST API برای ذخیره و بازیابی منوی هر کاربر در دیتابیس وردپرس
     */
    public function register_rest_routes() {
        register_rest_route( 'cafemenu/v1', '/cafe', array(
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'rest_get_user_cafe' ),
                'permission_callback' => function () {
                    return is_user_logged_in();
                },
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'rest_save_user_cafe' ),
                'permission_callback' => function () {
                    return is_user_logged_in();
                },
            ),
        ) );

        register_rest_route( 'cafemenu/v1', '/public-menu/(?P<slug>[a-zA-Z0-9\-]+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'rest_get_public_menu' ),
            'permission_callback' => '__return_true',
        ) );
    }

    public function rest_get_user_cafe() {
        $user_id = get_current_user_id();
        $state   = get_user_meta( $user_id, self::USER_META_CAFE, true );
        $plan    = get_user_meta( $user_id, self::USER_META_PLAN, true );

        return rest_ensure_response( array(
            'user_id'      => $user_id,
            'subscription' => is_array( $plan ) ? $plan : array( 'plan_id' => 'free', 'cycle' => 'monthly' ),
            'cafe_state'   => is_array( $state ) ? $state : null,
        ) );
    }

    public function rest_save_user_cafe( WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $payload = $request->get_json_params();

        if ( ! is_array( $payload ) ) {
            return new WP_Error( 'invalid_payload', 'داده نامعتبر است.', array( 'status' => 400 ) );
        }

        update_user_meta( $user_id, self::USER_META_CAFE, $payload );

        if ( ! empty( $payload['settings']['slug'] ) ) {
            $slug = sanitize_title( $payload['settings']['slug'] );
            update_option( 'cafemenu_slug_owner_' . $slug, $user_id, false );
        }

        return rest_ensure_response( array(
            'saved' => true,
        ) );
    }

    public function rest_get_public_menu( WP_REST_Request $request ) {
        $slug    = sanitize_title( $request['slug'] );
        $user_id = absint( get_option( 'cafemenu_slug_owner_' . $slug, 0 ) );

        if ( ! $user_id ) {
            return new WP_Error( 'not_found', 'منو یافت نشد.', array( 'status' => 404 ) );
        }

        $state = get_user_meta( $user_id, self::USER_META_CAFE, true );
        return rest_ensure_response( $state );
    }

    /**
     * فعال‌سازی خودکار اشتراک ماهانه / سالانه پس از تکمیل سفارش ووکامرس
     */
    public function handle_woocommerce_subscription( $order_id ) {
        if ( ! function_exists( 'wc_get_order' ) ) {
            return;
        }
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }
        $user_id = $order->get_user_id();
        if ( ! $user_id ) {
            return;
        }

        $opts = get_option( self::OPTION_SETTINGS, array() );

        foreach ( $order->get_items() as $item ) {
            $product_id = absint( $item->get_product_id() );
            $plan_data  = null;

            if ( $product_id && $product_id === absint( $opts['pro_monthly_id'] ?? 0 ) ) {
                $plan_data = array( 'plan_id' => 'pro', 'cycle' => 'monthly', 'days' => 30 );
            } elseif ( $product_id && $product_id === absint( $opts['pro_yearly_id'] ?? 0 ) ) {
                $plan_data = array( 'plan_id' => 'pro', 'cycle' => 'yearly', 'days' => 365 );
            } elseif ( $product_id && $product_id === absint( $opts['enterprise_monthly_id'] ?? 0 ) ) {
                $plan_data = array( 'plan_id' => 'enterprise', 'cycle' => 'monthly', 'days' => 30 );
            } elseif ( $product_id && $product_id === absint( $opts['enterprise_yearly_id'] ?? 0 ) ) {
                $plan_data = array( 'plan_id' => 'enterprise', 'cycle' => 'yearly', 'days' => 365 );
            }

            if ( $plan_data ) {
                update_user_meta( $user_id, self::USER_META_PLAN, array(
                    'plan_id'    => $plan_data['plan_id'],
                    'cycle'      => $plan_data['cycle'],
                    'expires_at' => gmdate( 'Y-m-d', time() + ( $plan_data['days'] * DAY_IN_SECONDS ) ),
                    'order_id'   => $order_id,
                ) );
            }
        }
    }

    /**
     * شورت‌کد نمایش کامل پلتفرم در برگه وردپرس
     */
    public function render_platform_shortcode() {
        $dist_index = plugin_dir_path( __FILE__ ) . 'dist/index.html';
        $dist_url   = plugin_dir_url( __FILE__ ) . 'dist/';
        $opts       = get_option( self::OPTION_SETTINGS, array() );

        if ( file_exists( $dist_index ) ) {
            $bridge = wp_json_encode( array(
                'restUrl' => esc_url_raw( rest_url( 'cafemenu/v1/' ) ),
                'nonce'   => wp_create_nonce( 'wp_rest' ),
                'userId'  => get_current_user_id(),
            ) );
            return '<script>window.CAFEMENU_WP=' . $bridge . ';</script>' .
                   '<iframe src="' . esc_url( $dist_url . 'index.html' ) . '" style="width:100%;min-height:90vh;border:0;border-radius:12px;" title="CafeMenu Platform"></iframe>';
        }

        if ( ! empty( $opts['app_url'] ) ) {
            return '<iframe src="' . esc_url( $opts['app_url'] ) . '" style="width:100%;min-height:90vh;border:0;border-radius:12px;" title="CafeMenu Platform"></iframe>';
        }

        return '<div dir="rtl" style="padding:16px;border:1px solid #ddd;border-radius:8px;">برای نمایش پلتفرم، ابتدا از پیشخوان وردپرس بخش <strong>منوساز CafeMenu</strong> پوشه <code>dist/</code> یا آدرس وب‌اپلیکیشن را تنظیم کنید.</div>';
    }

    /**
     * شورت‌کد نمایش منوی دیجیتال یک کافه خاص
     */
    public function render_digital_menu_shortcode( $atts ) {
        $atts = shortcode_atts( array(
            'slug' => 'roka-cafe',
        ), $atts, 'cafemenu_digital' );

        $opts     = get_option( self::OPTION_SETTINGS, array() );
        $dist_url = plugin_dir_url( __FILE__ ) . 'dist/index.html';
        $base_url = file_exists( plugin_dir_path( __FILE__ ) . 'dist/index.html' )
            ? $dist_url
            : ( $opts['app_url'] ?? '' );

        if ( empty( $base_url ) ) {
            return '';
        }

        $target = add_query_arg( array( 'menu' => sanitize_title( $atts['slug'] ) ), $base_url );
        return '<iframe src="' . esc_url( $target ) . '" style="width:100%;min-height:760px;border:0;border-radius:16px;" title="Digital Cafe Menu"></iframe>';
    }
}

new CafeMenu_SaaS_Platform();
