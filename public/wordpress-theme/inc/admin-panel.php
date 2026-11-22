<?php
/**
 * CafeMenu SaaS - WordPress Admin Management Panel
 * مدیریت کامل کافه‌ها، اشتراک‌های ماهانه/سالانه، تعرفه‌ها، ووکامرس و تیکت‌ها از پیشخوان وردپرس
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'admin_menu', function () {
    add_menu_page(
        'مدیریت پلتفرم CafeMenu',
        'مدیریت CafeMenu',
        'manage_options',
        'cafemenu-admin',
        'cafemenu_render_admin_dashboard',
        'dashicons-coffee',
        25
    );

    add_theme_page(
        'تنظیمات پوسته CafeMenu',
        'تنظیمات پوسته CafeMenu',
        'manage_options',
        'cafemenu-theme-options',
        'cafemenu_render_admin_dashboard'
    );
} );

add_action( 'admin_init', function () {
    register_setting( 'cafemenu_theme_group', CAFEMENU_THEME_OPTIONS, array(
        'sanitize_callback' => function ( $input ) {
            return array(
                'platform_name'         => isset( $input['platform_name'] ) ? sanitize_text_field( $input['platform_name'] ) : 'CafeMenu',
                'fallback_app_url'      => isset( $input['fallback_app_url'] ) ? esc_url_raw( $input['fallback_app_url'] ) : '',
                'pro_monthly_price'     => isset( $input['pro_monthly_price'] ) ? absint( $input['pro_monthly_price'] ) : 190000,
                'pro_yearly_price'      => isset( $input['pro_yearly_price'] ) ? absint( $input['pro_yearly_price'] ) : 1824000,
                'ent_monthly_price'     => isset( $input['ent_monthly_price'] ) ? absint( $input['ent_monthly_price'] ) : 450000,
                'ent_yearly_price'      => isset( $input['ent_yearly_price'] ) ? absint( $input['ent_yearly_price'] ) : 4320000,
                'free_max_products'     => isset( $input['free_max_products'] ) ? absint( $input['free_max_products'] ) : 15,
                'pro_monthly_id'        => isset( $input['pro_monthly_id'] ) ? absint( $input['pro_monthly_id'] ) : 0,
                'pro_yearly_id'         => isset( $input['pro_yearly_id'] ) ? absint( $input['pro_yearly_id'] ) : 0,
                'enterprise_monthly_id' => isset( $input['enterprise_monthly_id'] ) ? absint( $input['enterprise_monthly_id'] ) : 0,
                'enterprise_yearly_id'  => isset( $input['enterprise_yearly_id'] ) ? absint( $input['enterprise_yearly_id'] ) : 0,
            );
        },
    ) );
} );

/**
 * پردازش عملیات ادمین (تغییر اشتراک کافه‌دار، پاسخ به تیکت، فلاش پیوند یکتا)
 */
add_action( 'admin_post_cafemenu_admin_action', function () {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'عدم دسترسی مجاز.' );
    }
    check_admin_referer( 'cafemenu_admin_nonce' );

    $action_type = isset( $_POST['cm_action'] ) ? sanitize_text_field( wp_unslash( $_POST['cm_action'] ) ) : '';

    if ( 'update_user_plan' === $action_type ) {
        $target_user = absint( $_POST['user_id'] ?? 0 );
        $plan_id     = sanitize_text_field( wp_unslash( $_POST['plan_id'] ?? 'free' ) );
        $cycle       = sanitize_text_field( wp_unslash( $_POST['cycle'] ?? 'monthly' ) );
        $status      = sanitize_text_field( wp_unslash( $_POST['status'] ?? 'active' ) );
        $days        = ( 'yearly' === $cycle ) ? 365 : 30;

        if ( $target_user > 0 ) {
            update_user_meta( $target_user, CAFEMENU_USER_META_PLAN, array(
                'plan_id'    => in_array( $plan_id, array( 'free', 'pro', 'enterprise' ), true ) ? $plan_id : 'free',
                'cycle'      => in_array( $cycle, array( 'monthly', 'yearly' ), true ) ? $cycle : 'monthly',
                'status'     => ( 'suspended' === $status ) ? 'suspended' : 'active',
                'expires_at' => gmdate( 'Y-m-d', time() + ( $days * DAY_IN_SECONDS ) ),
            ) );
        }
        wp_safe_redirect( admin_url( 'admin.php?page=cafemenu-admin&tab=cafes&updated=1' ) );
        exit;
    }

    if ( 'reply_ticket' === $action_type ) {
        $ticket_id = sanitize_text_field( wp_unslash( $_POST['ticket_id'] ?? '' ) );
        $reply     = sanitize_textarea_field( wp_unslash( $_POST['reply_text'] ?? '' ) );
        $tickets   = get_option( 'cafemenu_platform_tickets', array() );

        if ( is_array( $tickets ) && $ticket_id && $reply ) {
            foreach ( $tickets as &$t ) {
                if ( isset( $t['id'] ) && $t['id'] === $ticket_id ) {
                    $t['reply']  = $reply;
                    $t['status'] = 'answered';
                }
            }
            unset( $t );
            update_option( 'cafemenu_platform_tickets', $tickets, false );
        }
        wp_safe_redirect( admin_url( 'admin.php?page=cafemenu-admin&tab=tickets&updated=1' ) );
        exit;
    }

    if ( 'flush_rewrites' === $action_type ) {
        flush_rewrite_rules();
        wp_safe_redirect( admin_url( 'admin.php?page=cafemenu-admin&tab=settings&flushed=1' ) );
        exit;
    }

    wp_safe_redirect( admin_url( 'admin.php?page=cafemenu-admin' ) );
    exit;
} );

function cafemenu_render_admin_dashboard() {
    $tab      = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'cafes';
    $opts     = get_option( CAFEMENU_THEME_OPTIONS, array() );
    $has_dist = ! empty( glob( get_template_directory() . '/dist/assets/*.js' ) );

    $users = get_users( array(
        'meta_key' => CAFEMENU_USER_META_CAFE,
        'number'   => 100,
    ) );
    $tickets = get_option( 'cafemenu_platform_tickets', array() );
    if ( ! is_array( $tickets ) ) {
        $tickets = array();
    }
    ?>
    <div class="wrap" dir="rtl" style="font-family: Vazirmatn, Tahoma, sans-serif;">
        <h1 style="font-weight: 800; margin-bottom: 12px;">پنل مدیریت پلتفرم منوساز CafeMenu</h1>

        <?php if ( isset( $_GET['updated'] ) ) : ?>
            <div class="notice notice-success is-dismissible"><p>تغییرات با موفقیت ذخیره شد.</p></div>
        <?php endif; ?>
        <?php if ( isset( $_GET['flushed'] ) ) : ?>
            <div class="notice notice-success is-dismissible"><p>ساختار لینک‌های اختصاصی منو (/menu/slug) بروزرسانی شد.</p></div>
        <?php endif; ?>

        <nav class="nav-tab-wrapper" style="margin-bottom: 20px;">
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=cafemenu-admin&tab=cafes' ) ); ?>" class="nav-tab <?php echo 'cafes' === $tab ? 'nav-tab-active' : ''; ?>">
                کافه‌ها و اشتراک‌ها (<?php echo count( $users ); ?>)
            </a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=cafemenu-admin&tab=plans' ) ); ?>" class="nav-tab <?php echo 'plans' === $tab ? 'nav-tab-active' : ''; ?>">
                تعرفه‌ها و ووکامرس
            </a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=cafemenu-admin&tab=tickets' ) ); ?>" class="nav-tab <?php echo 'tickets' === $tab ? 'nav-tab-active' : ''; ?>">
                تیکت‌های پشتیبانی (<?php echo count( $tickets ); ?>)
            </a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=cafemenu-admin&tab=settings' ) ); ?>" class="nav-tab <?php echo 'settings' === $tab ? 'nav-tab-active' : ''; ?>">
                تنظیمات پوسته و نصب
            </a>
        </nav>

        <?php if ( 'cafes' === $tab ) : ?>
            <div style="background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:18px;">
                <h2 style="margin-top:0;">فهرست کافه‌ها و وضعیت حق عضویت کاربران</h2>
                <?php if ( empty( $users ) ) : ?>
                    <p style="color:#666;">هنوز کاربری منوی کافه خود را در دیتابیس وردپرس ذخیره نکرده است. به محض ورود کاربران و ویرایش منو در سایت، فهرست کافه‌ها در این جدول نمایش داده می‌شود.</p>
                <?php else : ?>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>نام کافه</th>
                                <th>مدیر (کاربر وردپرس)</th>
                                <th>لینک منوی اختصاصی</th>
                                <th>تعداد محصولات</th>
                                <th>مدیریت اشتراک و وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ( $users as $u ) :
                                $cafe_state = get_user_meta( $u->ID, CAFEMENU_USER_META_CAFE, true );
                                $sub        = get_user_meta( $u->ID, CAFEMENU_USER_META_PLAN, true );
                                $cafe_name  = $cafe_state['settings']['cafeName'] ?? 'بدون نام';
                                $slug       = $cafe_state['settings']['slug'] ?? ( 'cafe-' . $u->ID );
                                $item_count = is_array( $cafe_state['items'] ?? null ) ? count( $cafe_state['items'] ) : 0;
                                $plan_id    = $sub['plan_id'] ?? 'free';
                                $cycle      = $sub['cycle'] ?? 'monthly';
                                $status     = $sub['status'] ?? 'active';
                                $menu_url   = home_url( '/menu/' . rawurlencode( $slug ) );
                                ?>
                                <tr>
                                    <td><strong><?php echo esc_html( $cafe_name ); ?></strong></td>
                                    <td><?php echo esc_html( $u->display_name . ' (' . $u->user_email . ')' ); ?></td>
                                    <td>
                                        <a href="<?php echo esc_url( $menu_url ); ?>" target="_blank" dir="ltr">
                                            /menu/<?php echo esc_html( $slug ); ?>
                                        </a>
                                    </td>
                                    <td><?php echo intval( $item_count ); ?> محصول</td>
                                    <td>
                                        <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                                            <?php wp_nonce_field( 'cafemenu_admin_nonce' ); ?>
                                            <input type="hidden" name="action" value="cafemenu_admin_action" />
                                            <input type="hidden" name="cm_action" value="update_user_plan" />
                                            <input type="hidden" name="user_id" value="<?php echo esc_attr( $u->ID ); ?>" />
                                            <select name="plan_id">
                                                <option value="free" <?php selected( $plan_id, 'free' ); ?>>پایه (رایگان)</option>
                                                <option value="pro" <?php selected( $plan_id, 'pro' ); ?>>حرفه‌ای</option>
                                                <option value="enterprise" <?php selected( $plan_id, 'enterprise' ); ?>>زنجیره‌ای</option>
                                            </select>
                                            <select name="cycle">
                                                <option value="monthly" <?php selected( $cycle, 'monthly' ); ?>>ماهانه</option>
                                                <option value="yearly" <?php selected( $cycle, 'yearly' ); ?>>سالانه</option>
                                            </select>
                                            <select name="status">
                                                <option value="active" <?php selected( $status, 'active' ); ?>>فعال</option>
                                                <option value="suspended" <?php selected( $status, 'suspended' ); ?>>معلق</option>
                                            </select>
                                            <button type="submit" class="button button-primary">بروزرسانی</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>

        <?php elseif ( 'plans' === $tab ) : ?>
            <form method="post" action="options.php" style="background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:18px;max-width:860px;">
                <?php settings_fields( 'cafemenu_theme_group' ); ?>
                <input type="hidden" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[platform_name]" value="<?php echo esc_attr( $opts['platform_name'] ?? 'CafeMenu' ); ?>" />
                <input type="hidden" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[fallback_app_url]" value="<?php echo esc_attr( $opts['fallback_app_url'] ?? '' ); ?>" />

                <h2 style="margin-top:0;">مدیریت قیمت پلن‌ها و اتصال محصولات ووکامرس</h2>
                <table class="form-table">
                    <tr>
                        <th>سقف محصولات پلن رایگان</th>
                        <td><input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[free_max_products]" value="<?php echo esc_attr( $opts['free_max_products'] ?? 15 ); ?>" class="small-text" /></td>
                    </tr>
                    <tr>
                        <th>قیمت پلن حرفه‌ای (تومان)</th>
                        <td>
                            ماهانه: <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[pro_monthly_price]" value="<?php echo esc_attr( $opts['pro_monthly_price'] ?? 190000 ); ?>" />
                            &nbsp;&nbsp;
                            سالانه: <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[pro_yearly_price]" value="<?php echo esc_attr( $opts['pro_yearly_price'] ?? 1824000 ); ?>" />
                        </td>
                    </tr>
                    <tr>
                        <th>شناسه محصول ووکامرس - حرفه‌ای</th>
                        <td>
                            ماهانه (ID): <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[pro_monthly_id]" value="<?php echo esc_attr( $opts['pro_monthly_id'] ?? 0 ); ?>" class="small-text" />
                            &nbsp;&nbsp;
                            سالانه (ID): <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[pro_yearly_id]" value="<?php echo esc_attr( $opts['pro_yearly_id'] ?? 0 ); ?>" class="small-text" />
                        </td>
                    </tr>
                    <tr>
                        <th>قیمت پلن زنجیره‌ای (تومان)</th>
                        <td>
                            ماهانه: <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[ent_monthly_price]" value="<?php echo esc_attr( $opts['ent_monthly_price'] ?? 450000 ); ?>" />
                            &nbsp;&nbsp;
                            سالانه: <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[ent_yearly_price]" value="<?php echo esc_attr( $opts['ent_yearly_price'] ?? 4320000 ); ?>" />
                        </td>
                    </tr>
                    <tr>
                        <th>شناسه محصول ووکامرس - زنجیره‌ای</th>
                        <td>
                            ماهانه (ID): <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[enterprise_monthly_id]" value="<?php echo esc_attr( $opts['enterprise_monthly_id'] ?? 0 ); ?>" class="small-text" />
                            &nbsp;&nbsp;
                            سالانه (ID): <input type="number" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[enterprise_yearly_id]" value="<?php echo esc_attr( $opts['enterprise_yearly_id'] ?? 0 ); ?>" class="small-text" />
                        </td>
                    </tr>
                </table>
                <?php submit_button( 'ذخیره تعرفه‌ها و اتصال ووکامرس' ); ?>
            </form>

        <?php elseif ( 'tickets' === $tab ) : ?>
            <div style="background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:18px;max-width:860px;">
                <h2 style="margin-top:0;">مدیریت تیکت‌های پشتیبانی کافه‌ها</h2>
                <?php if ( empty( $tickets ) ) : ?>
                    <p style="color:#666;">تیکتی از سوی کافه‌داران ثبت نشده است.</p>
                <?php else : ?>
                    <?php foreach ( $tickets as $t ) : ?>
                        <div style="border:1px solid #e5e5e5;border-radius:8px;padding:14px;margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;">
                                <strong><?php echo esc_html( $t['subject'] ?? '' ); ?></strong>
                                <span><?php echo ( 'answered' === ( $t['status'] ?? '' ) ) ? 'پاسخ داده شده' : 'در انتظار پاسخ'; ?></span>
                            </div>
                            <p style="color:#444;margin:8px 0;"><?php echo esc_html( $t['message'] ?? '' ); ?></p>
                            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:flex;gap:8px;margin-top:8px;">
                                <?php wp_nonce_field( 'cafemenu_admin_nonce' ); ?>
                                <input type="hidden" name="action" value="cafemenu_admin_action" />
                                <input type="hidden" name="cm_action" value="reply_ticket" />
                                <input type="hidden" name="ticket_id" value="<?php echo esc_attr( $t['id'] ?? '' ); ?>" />
                                <input type="text" name="reply_text" value="<?php echo esc_attr( $t['reply'] ?? '' ); ?>" placeholder="پاسخ خود را بنویسید..." style="flex:1;" />
                                <button type="submit" class="button button-primary">ارسال پاسخ</button>
                            </form>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

        <?php else : ?>
            <div style="background:#fff;border:1px solid #dcdcde;border-radius:10px;padding:18px;max-width:860px;">
                <h2 style="margin-top:0;">وضعیت فایل‌های پوسته و پیوندهای اختصاصی</h2>
                <p>
                    <strong>وضعیت فایل‌های بیلد React (dist): </strong>
                    <?php if ( $has_dist ) : ?>
                        <span style="color:#0a7d32;font-weight:bold;">فعال و متصل از مسیر پوسته</span>
                    <?php else : ?>
                        <span style="color:#b45309;">پوشه dist/ یافت نشد — خروجی <code>npm run build</code> را داخل پوشه <code>dist/</code> پوسته قرار دهید یا آدرس جایگزین را وارد کنید.</span>
                    <?php endif; ?>
                </p>

                <form method="post" action="options.php">
                    <?php settings_fields( 'cafemenu_theme_group' ); ?>
                    <table class="form-table">
                        <tr>
                            <th>نام پلتفرم</th>
                            <td><input type="text" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[platform_name]" value="<?php echo esc_attr( $opts['platform_name'] ?? 'CafeMenu' ); ?>" /></td>
                        </tr>
                        <tr>
                            <th>آدرس وب‌اپلیکیشن جایگزین (در صورت نبود dist)</th>
                            <td><input type="url" dir="ltr" class="regular-text" name="<?php echo esc_attr( CAFEMENU_THEME_OPTIONS ); ?>[fallback_app_url]" value="<?php echo esc_attr( $opts['fallback_app_url'] ?? '' ); ?>" /></td>
                        </tr>
                    </table>
                    <?php submit_button( 'ذخیره تنظیمات عمومی' ); ?>
                </form>

                <hr style="margin:20px 0;" />
                <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                    <?php wp_nonce_field( 'cafemenu_admin_nonce' ); ?>
                    <input type="hidden" name="action" value="cafemenu_admin_action" />
                    <input type="hidden" name="cm_action" value="flush_rewrites" />
                    <p>برای فعال‌سازی لینک‌های اختصاصی منوی کافه‌ها به شکل <code>/menu/roka-cafe</code> دکمه زیر را بزنید:</p>
                    <button type="submit" class="button">بروزرسانی پیوندهای اختصاصی منو (Flush Permalinks)</button>
                </form>
            </div>
        <?php endif; ?>
    </div>
    <?php
}
