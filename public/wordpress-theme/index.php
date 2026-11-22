<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();

$has_dist = ! empty( glob( get_template_directory() . '/dist/assets/*.js' ) );
$opts     = get_option( 'cafemenu_theme_options', array() );

if ( $has_dist ) : ?>
    <div id="root"></div>
<?php elseif ( ! empty( $opts['fallback_app_url'] ) ) : ?>
    <iframe
        src="<?php echo esc_url( $opts['fallback_app_url'] ); ?>"
        style="width:100%;height:100vh;border:0;display:block;"
        title="CafeMenu SaaS Platform"
    ></iframe>
<?php else : ?>
    <main dir="rtl" style="max-width:720px;margin:48px auto;padding:32px;background:#fff;border:1px solid #e5e5e5;border-radius:16px;font-family:Vazirmatn,Tahoma,sans-serif;line-height:1.9;">
        <h1 style="margin-top:0;font-size:22px;color:#181722;">پوسته CafeMenu SaaS با موفقیت فعال شد</h1>
        <p style="color:#444;">برای تکمیل راه‌اندازی یکی از دو روش زیر را انجام دهید:</p>
        <ol style="padding-right:20px;color:#333;">
            <li>در پوشه پروژه دستور <code>npm run build</code> را اجرا کنید و پوشه خروجی <code>dist/</code> را در مسیر <code><?php echo esc_html( get_template_directory() ); ?>/dist/</code> آپلود نمایید.</li>
            <li>یا از پیشخوان وردپرس ← بخش <strong>تنظیمات پوسته CafeMenu</strong>، آدرس وب‌اپلیکیشن میزبانی‌شده را ثبت کنید تا مستقیماً نمایش داده شود.</li>
        </ol>
        <p style="margin-top:20px;">
            <a href="<?php echo esc_url( admin_url( 'themes.php?page=cafemenu-theme-options' ) ); ?>" style="display:inline-block;padding:10px 20px;background:#E66F1E;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;">
                ورود به تنظیمات پوسته CafeMenu
            </a>
        </p>
    </main>
<?php
endif;

get_footer();
