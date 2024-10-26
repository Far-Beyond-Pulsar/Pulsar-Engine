
use std::cell::RefCell;
use std::rc::Rc;
use std::{cell::Ref, collections::HashMap};
use std::any::Any;
use std::default::Default;
use std::iter::Map;
use hey_listen::sync::{
    ParallelDispatcher, ParallelListener, ParallelDispatchResult,
};
use ez_logging::println;
#[macro_use]
extern crate ez_logging;

#[derive(Clone, PartialEq)]

enum Variant {
    Int(i32),
    Uint(usize),
    String(String),
    Vector2(f32,f32),
    Vector3(f32,f32),
    Vector2i(i32,i32),
    Vector3i(i32,i32),
} // why do we have this again?

// #[derive(Clone)]
// enum Event {
//     Variant,
// }


struct  Listener {}

// impl ParallelListener<Event> for Listener {
//     fn on_event(&self, _event: &Event) -> Option<ParallelDispatchResult> {
//         println!("Listener Registered");

//         None
//     }
// }

// Move enums and implementations outside of impl blocks
#[derive(Debug)]
enum Error {
    InvalidName(String),
    NameTaken(String),
    FailedToCreateComponent(String)
}
struct Event<Type> { // Generic
    name: String,
    data: Type,
}
// struct Dispa`tcher {
//     events:Vec<Event<dyn Any>>
// }
#[derive(Debug)]
enum ComponentStatus {
    Active, // Captures propogated events
    Inactive, // Captures propgated events but does not interact
    Disabled, // Does not capture events
}
#[derive(Default)]
pub struct Object {
    pub name: String,
    pub components: HashMap<usize, Rc<RefCell<Box<Component>>>> // and so it begins
}

pub struct Component {
    name: String,
    status: ComponentStatus,
}

impl Object {
    fn add_component(&mut self, new_component: Component) -> Result<Rc<RefCell<Box<Component>>>, Error> {
        let id = self.components.len() + 1;
        let new_ref = Rc::new(RefCell::new(Box::new(new_component)));
        self.components.insert(id, Rc::clone(&new_ref));
        Ok(new_ref)
    }

    // We may decide to remove this later
    fn create_component() {
        // Implementation pending
    }
}

impl Component {
    fn new(name: &str) -> Self where Self: Sized {
        let new_component = Component {
            status: ComponentStatus::Active,
            name: String::from(name)
        };
        // dispatcher.dispatch_event(&Event::Variant);
        return new_component;
    }

    fn ready(&mut self) {
        // Implementation pending
        println!("{} is ready!",self.name)
    }

    fn process(&mut self) {
        // Implementation pending
    }

    fn on_event(&mut self, event: &(dyn Any + Send + Sync)) {
        // Implementation pending
    }
    async fn setup(&self) {
        
    }
}

impl ComponentStatus {
    fn set(&mut self, new_status: ComponentStatus) -> ComponentStatus {
        println!("Set status to {:#?}",new_status);
        match new_status {
            ComponentStatus::Active => ComponentStatus::Active,
            ComponentStatus::Inactive => ComponentStatus::Inactive,
            ComponentStatus::Disabled => ComponentStatus::Disabled,
        }
    }
    fn get(&self) -> ComponentStatus { // this is so stupid - caz from liveshare
        match self {
            ComponentStatus::Active => return ComponentStatus::Active,
            ComponentStatus::Inactive => return ComponentStatus::Inactive,
            ComponentStatus::Disabled => return ComponentStatus::Disabled,
        }
    }
    fn is_active(&self) -> bool {
        match self {
            ComponentStatus::Active => true,
            _ => false
        }
    }
}

fn main() {
    ez_logging::init();
    println!("Hello, world!");
    let test: Component = Component::new("name");
    let test2: Component = Component::new("name2");
    let mut obj: Object = Object::default();
    let new_reference = obj.add_component(test).unwrap();
    new_reference.borrow_mut().status.set(ComponentStatus::Active);
    new_reference.borrow_mut().status.set(ComponentStatus::Disabled);
    match new_reference.borrow().status.get() {
        ComponentStatus::Active => println!("test"),
        _ => panic!()
    }

    if new_reference.borrow().status.is_active() {
        println!("new reference is active")
    } else {
        panic!("reference not active")
    }

    new_reference.borrow_mut().name = String::from("sdf");
    new_reference.borrow_mut().name = String::from("sdf");
    let ref2 = obj.add_component(test2).unwrap();
    ref2.borrow_mut().ready();
    new_reference.borrow_mut().ready();
}