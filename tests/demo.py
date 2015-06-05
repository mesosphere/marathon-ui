import sys
import unittest
import logging
import re

from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait

import conf


class AbstractMarathonTest(unittest.TestCase):
    def setUp(self):
        profile = webdriver.FirefoxProfile()
        self.driver = webdriver.Firefox(firefox_profile=profile)
        self.driver.implicitly_wait(10)
        self.driver.get(conf.ConfigMarathon.main_url())

    def tearDown(self):
        self.driver.close()

    def go_home(self):
        self.driver.get(conf.ConfigMarathon.main_url())

    def wait_until_find_by_xpath(self, xpath, timeout=3):
        return WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.find_element_by_xpath(xpath)
        )

    def wait_until_find_by_name(self, name, timeout=3):
        return WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.find_element_by_name(name)
        )

    def wait_until_find_by_id(self, id_element, timeout=3):
        return WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.find_element_by_id(id_element)
        )

    def wait_until_find_by_link_text(self, link_text, timeout=3):
        return WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.find_element_by_link_text(link_text)
        )

    def wait_until_find_by_css(self, css_path, timeout=3):
        return WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.find_element_by_css_selector(css_path)
        )

    def wait_until_find_by_class(self, class_name, timeout=3):
        return WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.find_element_by_class_name(class_name)
        )

    def wait_until_find_by(self, selector, by_what, timeout=3):
        return WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.find_elements(by_what, selector)
        )


class TestDemo(AbstractMarathonTest):
    def fill_form_new_app(self, map_id_val):
        for key_id in map_id_val:
            self.wait_until_find_by_id(key_id).clear()
            self.wait_until_find_by_id(key_id).send_keys(map_id_val[key_id])

    def test_create_and_delete_apps(self):
        """Test Create simple application."""
        logger = logging.getLogger("TestDemo.test_create_and_delete_apps")
        logger.info("Create application")

        self.driver.get(conf.ConfigMarathon.main_url())
        app_conf = {
            "id-field": "test-app",
            "cpus-field": "0.5",
            "mem-field": "32",
            "disk-field": "1",
            "instances-field": "2",
            "cmd-field": "python",
            "ports-field": ""
        }
        self.wait_until_find_by_css('div.active.tab-pane > a').click()
        self.fill_form_new_app(app_conf)
        self.wait_until_find_by_css('div:nth-child(13) > input').click()

        table_of_all_apps = self.driver.find_element_by_xpath('//table')
        rows = table_of_all_apps.find_elements_by_tag_name("tr")[4:]

        logger.info("Application must be only one")

        self.assertEqual(len(rows), 1, msg='Application must be only one')
        cells = rows[0].find_elements_by_tag_name("td")

        logger.info("Check if-field name is right")
        self.assertEqual(cells[0].text, "/" + app_conf["id-field"], msg='Check if-field name is right')
        logger.info("Check mem-field value is right")
        self.assertEqual(cells[1].text, app_conf["mem-field"], msg='Check mem-field value is right')
        logger.info("Check cpus-field value is right")
        self.assertEqual(cells[2].text, app_conf["cpus-field"], msg='Check cpus-field value is right')

        logger.info("Delete application")
        cells[0].click()
        self.wait_until_find_by_xpath("//*[contains(text(), 'Destroy App')]").click()
        self.driver.switch_to.alert.accept()
        self.go_home()

        table_of_all_apps = self.wait_until_find_by_xpath('//table')
        rows = table_of_all_apps.find_elements_by_tag_name("tr")[4:]
        logger.info("Application must be zero")
        self.assertEqual(len(rows), 0, msg='Application must be zero')

        src_page = self.driver.page_source
        logger.info("Should show test No running apps")
        text_found = re.search(r'No running apps', src_page)
        self.assertNotEqual(text_found, None)


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("TestDemo.test_create_and_delete_apps").setLevel(logging.DEBUG)
    unittest.main()
