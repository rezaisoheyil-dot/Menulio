<?php
/**
 * CafeMenu SaaS Theme Functions
 * بارگذاری باندل React، مسیرهای /menu/{slug}، ثبت REST API، و همگام‌سازی اشتراک‌های ووکامرس
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'CAFEMENU_THEME_OPTIONS', 'cafemenu_theme_options' );
define( 'CAFEMENU_USER_META_CAFE', 'cafemenu_user_cafe_state' );
define( 'CAFEMENU_USER_META_PLAN', 'cafemenu_user_subscription' );

require_once get_template_directory() . '/inc/admin-panel.php';

add_action( 'after_setup_theme', function () {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'woocommerce' );
} );

/**
 * لینک اختصاصی منوی هر کافه: /menu/{slug}
 */
add_action( 'init', function () {
    add_rewrite_rule( '^menu/([^/]+)/?$', 'index.php?cafemenu_slug=$matches[1]', 'top' );
} );

add_filter( 'query_vars', function ( $vars ) {
    $vars[] = 'cafemenu_slug';
    return $vars;
} );

add_action( 'after_switch_theme', function () {
    flush_rewrite_rules();
} );

/**
 * بارگذاری خودکار فایل‌های CSS و JS بیلد شده از پوشه dist/assets/
 */
add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style( 'cafemenu-theme-style', get_stylesheet_uri(), array(), '1.1.0' );

    $dist_dir = get_template_directory() . '/dist';
    $dist_uri = get_template_directory_uri() . '/dist';
    $opts     = get_option( CAFEMENU_THEME_OPTIONS, array() );
    $menu_slug = get_query_var( 'cafemenu_slug' );

    $css_files = glob( $dist_dir . '/assets/*.css' );
    if ( ! empty( $css_files ) ) {
        foreach ( $css_files as $index => $css_path ) {
            wp_enqueue_style( 'cafemenu-app-css-' . $index, $dist_uri . '/assets/' . basename( $css_path ), array(), '1.1.0' );
        }
    }

    $js_files = glob( $dist_dir . '/assets/*.js' );
    if ( ! empty( $js_files ) ) {
        foreach ( $js_files as $index => $js_path ) {
            $handle = 'cafemenu-app-js-' . $index;
            wp_enqueue_script( $handle, $dist_uri . '/assets/' . basename( $js_path ), array(), '1.1.0', true );

            if ( 0 === $index ) {
                wp_localize_script( $handle, 'CAFEMENU_WP', array(
                    'restUrl'         => esc_url_raw( rest_url( 'cafemenu/v1/' ) ),
                    'nonce'           => wp_create_nonce( 'wp_rest' ),
                    'userId'          => get_current_user_id(),
                    'isLoggedIn'      => is_user_logged_in(),
                    'isAdmin'         => current_user_can( 'manage_options' ),
                    'adminUrl'        => esc_url_raw( admin_url( 'admin.php?page=cafemenu-admin' ) ),
                    'themeDistUrl'    => esc_url_raw( $dist_uri ),
                    'loginUrl'        => esc_url_raw( wp_login_url( home_url( '/' ) ) ),
                    'registerUrl'     => esc_url_raw( wp_registration_url() ),
                    'initialMenuSlug' => $menu_slug ? sanitize_title( $menu_slug ) : '',
                    'planOverrides'   => array(
                        'proMonthlyPrice' => absint( $opts['pro_monthly_price'] ?? 190000 ),
                        'proYearlyPrice'  => absint( $opts['pro_yearly_price'] ?? 1824000 ),
                        'entMonthlyPrice' => absint( $opts['ent_monthly_price'] ?? 450000 ),
                        'entYearlyPrice'  => absint( $opts['ent_yearly_price'] ?? 4320000 ),
                        'freeMaxProducts' => absint( $opts['free_max_products'] ?? 15 ),
                    ),
                ) );
            }
        }
    }
} );

add_filter( 'script_loader_tag', function ( $tag, $handle, $src ) {
    if ( 0 === strpos( $handle, 'cafemenu-app-js-' ) ) {
        return '<script type="module" crossorigin src="' . esc_url( $src ) . '"></script>' . "\n";
    }
    return $tag;
}, 10, 3 );

/**
 * مسیرهای REST API اختصاصی برای ذخیره منو، تیکت‌ها و نمایش عمومی منو
 */
add_action( 'rest_api_init', function () {
    register_rest_route( 'cafemenu/v1', '/cafe', array(
        array(
            'methods'             => 'GET',
            'callback'            => function () {
                $user_id = get_current_user_id();
                return rest_ensure_response( array(
                    'user_id'      => $user_id,
                    'subscription' => get_user_meta( $user_id, CAFEMENU_USER_META_PLAN, true ),
                    'cafe_state'   => get_user_meta( $user_id, CAFEMENU_USER_META_CAFE, true ),
                ) );
            },
            'permission_callback' => function () {
                return is_user_logged_in();
            },
        ),
        array(
            'methods'             => 'POST',
            'callback'            => function ( WP_REST_Request $request ) {
                $user_id = get_current_user_id();
                $payload = $request->get_json_params();
                if ( ! is_array( $payload ) ) {
                    return new WP_Error( 'invalid_payload', 'داده نامعتبر است.', array( 'status' => 400 ) );
                }
                update_user_meta( $user_id, CAFEMENU_USER_META_CAFE, $payload );
                if ( ! empty( $payload['settings']['slug'] ) ) {
                    update_option( 'cafemenu_slug_owner_' . sanitize_title( $payload['settings']['slug'] ), $user_id, false );
                }
                return rest_ensure_response( array( 'saved' => true ) );
            },
            'permission_callback' => function () {
                return is_user_logged_in();
            },
        ),
    ) );

    register_rest_route( 'cafemenu/v1', '/public-menu/(?P<slug>[a-zA-Z0-9\-]+)', array(
        'methods'             => 'GET',
        'callback'            => function ( WP_REST_Request $request ) {
            $slug    = sanitize_title( $request['slug'] );
            $user_id = absint( get_option( 'cafemenu_slug_owner_' . $slug, 0 ) );
            if ( ! $user_id ) {
                return new WP_Error( 'not_found', 'منو یافت نشد.', array( 'status' => 404 ) );
            }
            return rest_ensure_response( get_user_meta( $user_id, CAFEMENU_USER_META_CAFE, true ) );
        },
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'cafemenu/v1', '/tickets', array(
        'methods'             => 'POST',
        'callback'            => function ( WP_REST_Request $request ) {
            $payload = $request->get_json_params();
            $tickets = get_option( 'cafemenu_platform_tickets', array() );
            if ( ! is_array( $tickets ) ) {
                $tickets = array();
            }
            $tickets[] = array(
                'id'        => sanitize_text_field( $payload['id'] ?? uniqid( 'TCK-' ) ),
                'subject'   => sanitize_text_field( $payload['subject'] ?? '' ),
                'category'  => sanitize_text_field( $payload['category'] ?? '' ),
                'message'   => sanitize_textarea_field( $payload['message'] ?? '' ),
                'status'    => 'open',
                'createdAt' => sanitize_text_field( $payload['createdAt'] ?? gmdate( 'Y-m-d' ) ),
                'user_id'   => get_current_user_id(),
            );
            update_option( 'cafemenu_platform_tickets', $tickets, false );
            return rest_ensure_response( array( 'created' => true ) );
        },
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ) );
} );

/**
 * فعال‌سازی خودکار اشتراک ماهانه / سالانه پس از خرید محصول در ووکامرس
 */
add_action( 'woocommerce_order_status_completed', function ( $order_id ) {
    if ( ! function_exists( 'wc_get_order' ) ) {
        return;
    }
    $order = wc_get_order( $order_id );
    if ( ! $order || ! $order->get_user_id() ) {
        return;
    }
    $user_id = $order->get_user_id();
    $opts    = get_option( CAFEMENU_THEME_OPTIONS, array() );

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
            update_user_meta( $user_id, CAFEMENU_USER_META_PLAN, array(
                'plan_id'    => $plan_data['plan_id'],
                'cycle'      => $plan_data['cycle'],
                'status'     => 'active',
                'expires_at' => gmdate( 'Y-m-d', time() + ( $plan_data['days'] * DAY_IN_SECONDS ) ),
                'order_id'   => $order_id,
            ) );
        }
    }
} );
