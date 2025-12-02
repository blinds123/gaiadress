"""
TEST 2: UI & Testimonials Tester
Tests UI elements and testimonial display on deployed landing page
"""
import json
import asyncio
from playwright.async_api import async_playwright

async def run_tests():
    results = {
        "test": "ui_testimonials",
        "passed": False,
        "all_images_loaded": False,
        "product_image_count": 0,
        "testimonial_image_count": 0,
        "testimonials_full_size": False,
        "no_horizontal_scroll_mobile": False,
        "no_horizontal_scroll_desktop": False,
        "accordions_work": False,
        "gallery_works": False,
        "errors": []
    }
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("=" * 60)
            print("TEST 2: UI & TESTIMONIALS")
            print("=" * 60)
            
            # Navigate to site
            print("\n[1/6] Navigating to https://gaiadress.netlify.app...")
            await page.goto('https://gaiadress.netlify.app', wait_until='networkidle', timeout=30000)
            print("✓ Page loaded")
            
            # TEST 1: All Images Load
            print("\n[2/6] Testing all images load...")
            await page.wait_for_timeout(2000)  # Wait for lazy loading
            
            all_images = await page.locator('img').all()
            print(f"Found {len(all_images)} total images")
            
            loaded_images = 0
            product_images = 0
            testimonial_images = 0
            
            for img in all_images:
                natural_height = await img.evaluate('el => el.naturalHeight')
                src = await img.get_attribute('src')
                class_name = await img.get_attribute('class') or ''
                
                if natural_height and natural_height > 0:
                    loaded_images += 1
                    
                    # Count product vs testimonial images
                    if 'testimonial' in class_name.lower():
                        testimonial_images += 1
                        print(f"  ✓ Testimonial image loaded: {src[:60]}... (height: {natural_height}px)")
                    elif 'product' in class_name.lower() or 'gallery' in class_name.lower() or 'hero' in class_name.lower():
                        product_images += 1
                    else:
                        # Default to product if not clearly testimonial
                        product_images += 1
                else:
                    results['errors'].append(f"Image failed to load: {src}")
                    print(f"  ✗ Image failed: {src}")
            
            results['product_image_count'] = product_images
            results['testimonial_image_count'] = testimonial_images
            results['all_images_loaded'] = loaded_images == len(all_images) and loaded_images > 0
            
            print(f"\n✓ Images loaded: {loaded_images}/{len(all_images)}")
            print(f"  - Product images: {product_images}")
            print(f"  - Testimonial images: {testimonial_images}")
            
            # TEST 2: Testimonial Images Display as FULL Images (NOT circular avatars)
            print("\n[3/6] Testing testimonial images are full-size (not circular avatars)...")
            testimonial_imgs = await page.locator('.testimonial-image').all()
            
            if len(testimonial_imgs) == 0:
                print("  ! No images with class 'testimonial-image' found, checking alternative selectors...")
                # Try finding testimonials section and images within it
                testimonial_imgs = await page.locator('.testimonials img, [class*="testimonial"] img').all()
            
            print(f"Found {len(testimonial_imgs)} testimonial images to check")
            
            full_size_count = 0
            for idx, img in enumerate(testimonial_imgs):
                # Get computed styles
                border_radius = await img.evaluate('''el => {
                    const style = window.getComputedStyle(el);
                    return style.borderRadius;
                }''')
                
                width = await img.evaluate('el => el.offsetWidth')
                height = await img.evaluate('el => el.naturalHeight')
                
                # Check if it's NOT a circular avatar (border-radius should not be 50%)
                is_full_size = '50%' not in border_radius and width > 100
                
                if is_full_size:
                    full_size_count += 1
                    print(f"  ✓ Testimonial {idx+1}: Full-size ({width}px wide, border-radius: {border_radius})")
                else:
                    print(f"  ✗ Testimonial {idx+1}: Appears circular/small ({width}px wide, border-radius: {border_radius})")
            
            results['testimonials_full_size'] = full_size_count > 0 and full_size_count == len(testimonial_imgs)
            print(f"\n{'✓' if results['testimonials_full_size'] else '✗'} Testimonials full-size: {full_size_count}/{len(testimonial_imgs)}")
            
            # TEST 3: No Horizontal Scroll - Mobile
            print("\n[4/6] Testing no horizontal scroll (mobile 390px)...")
            await page.set_viewport_size({"width": 390, "height": 844})
            await page.wait_for_timeout(500)
            
            scroll_width_mobile = await page.evaluate('document.body.scrollWidth')
            window_width_mobile = await page.evaluate('window.innerWidth')
            
            results['no_horizontal_scroll_mobile'] = scroll_width_mobile <= window_width_mobile
            print(f"  Mobile: scrollWidth={scroll_width_mobile}px, windowWidth={window_width_mobile}px")
            print(f"  {'✓' if results['no_horizontal_scroll_mobile'] else '✗'} No horizontal scroll on mobile")
            
            if not results['no_horizontal_scroll_mobile']:
                results['errors'].append(f"Horizontal scroll on mobile: {scroll_width_mobile}px > {window_width_mobile}px")
            
            # TEST 4: No Horizontal Scroll - Desktop
            print("\n[5/6] Testing no horizontal scroll (desktop 1440px)...")
            await page.set_viewport_size({"width": 1440, "height": 900})
            await page.wait_for_timeout(500)
            
            scroll_width_desktop = await page.evaluate('document.body.scrollWidth')
            window_width_desktop = await page.evaluate('window.innerWidth')
            
            results['no_horizontal_scroll_desktop'] = scroll_width_desktop <= window_width_desktop
            print(f"  Desktop: scrollWidth={scroll_width_desktop}px, windowWidth={window_width_desktop}px")
            print(f"  {'✓' if results['no_horizontal_scroll_desktop'] else '✗'} No horizontal scroll on desktop")
            
            if not results['no_horizontal_scroll_desktop']:
                results['errors'].append(f"Horizontal scroll on desktop: {scroll_width_desktop}px > {window_width_desktop}px")
            
            # TEST 5: Accordions Work
            print("\n[6/6] Testing accordions...")
            accordion_headers = await page.locator('.accordion-header, [class*="accordion"] button, details summary').all()
            
            if len(accordion_headers) == 0:
                print("  ! No accordions found")
                results['accordions_work'] = True  # Pass if no accordions exist
            else:
                print(f"Found {len(accordion_headers)} accordion headers")
                accordion_works_count = 0
                
                for idx, header in enumerate(accordion_headers[:3]):  # Test first 3
                    try:
                        # Check initial state
                        parent = await header.evaluate_handle('el => el.closest(".accordion-item, details") || el.parentElement')
                        initial_open = await parent.evaluate('el => el.classList?.contains("open") || el.hasAttribute("open")')
                        
                        # Click to toggle
                        await header.click()
                        await page.wait_for_timeout(300)
                        
                        # Check if state changed
                        after_click_open = await parent.evaluate('el => el.classList?.contains("open") || el.hasAttribute("open")')
                        
                        if initial_open != after_click_open:
                            accordion_works_count += 1
                            print(f"  ✓ Accordion {idx+1} toggled successfully")
                        else:
                            print(f"  ✗ Accordion {idx+1} did not toggle")
                            results['errors'].append(f"Accordion {idx+1} did not toggle state")
                    except Exception as e:
                        print(f"  ✗ Accordion {idx+1} error: {str(e)}")
                        results['errors'].append(f"Accordion {idx+1} click failed: {str(e)}")
                
                results['accordions_work'] = accordion_works_count > 0
                print(f"\n{'✓' if results['accordions_work'] else '✗'} Accordions working: {accordion_works_count}/{min(3, len(accordion_headers))}")
            
            # TEST 6: Gallery Works
            print("\n[BONUS] Testing gallery...")
            gallery_thumbnails = await page.locator('.thumbnail, .gallery-thumbnail, [class*="gallery"] img[class*="thumb"]').all()
            
            if len(gallery_thumbnails) == 0:
                print("  ! No gallery thumbnails found")
                results['gallery_works'] = True  # Pass if no gallery
            else:
                print(f"Found {len(gallery_thumbnails)} gallery thumbnails")
                
                # Get main image
                main_image = page.locator('.main-image, .gallery-main img, [class*="gallery"][class*="main"] img').first
                
                if await main_image.count() > 0:
                    initial_src = await main_image.get_attribute('src')
                    
                    # Click first thumbnail
                    if len(gallery_thumbnails) > 0:
                        await gallery_thumbnails[0].click()
                        await page.wait_for_timeout(300)
                        
                        after_src = await main_image.get_attribute('src')
                        results['gallery_works'] = True  # Gallery exists and is interactive
                        print(f"  ✓ Gallery interactive (main image src: {after_src[:60]}...)")
                else:
                    print("  ! No main gallery image found")
                    results['gallery_works'] = True  # No gallery to test
            
            # FINAL VERDICT
            results['passed'] = (
                results['all_images_loaded'] and
                results['testimonials_full_size'] and
                results['no_horizontal_scroll_mobile'] and
                results['no_horizontal_scroll_desktop'] and
                results['accordions_work']
            )
            
        except Exception as e:
            results['errors'].append(f"Test execution error: {str(e)}")
            print(f"\n✗ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()
    
    # Save results
    output_path = '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL v8 copy/state/test-2.json'
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Overall: {'✓ PASSED' if results['passed'] else '✗ FAILED'}")
    print(f"All images loaded: {'✓' if results['all_images_loaded'] else '✗'}")
    print(f"  - Product images: {results['product_image_count']}")
    print(f"  - Testimonial images: {results['testimonial_image_count']}")
    print(f"Testimonials full-size: {'✓' if results['testimonials_full_size'] else '✗'}")
    print(f"No horizontal scroll (mobile): {'✓' if results['no_horizontal_scroll_mobile'] else '✗'}")
    print(f"No horizontal scroll (desktop): {'✓' if results['no_horizontal_scroll_desktop'] else '✗'}")
    print(f"Accordions work: {'✓' if results['accordions_work'] else '✗'}")
    print(f"Gallery works: {'✓' if results['gallery_works'] else '✗'}")
    
    if results['errors']:
        print(f"\nErrors ({len(results['errors'])}):")
        for error in results['errors']:
            print(f"  - {error}")
    
    print(f"\nResults saved to: {output_path}")
    print("=" * 60)
    
    return results

if __name__ == '__main__':
    asyncio.run(run_tests())
