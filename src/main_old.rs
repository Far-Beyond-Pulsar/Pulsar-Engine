///////////////////////////////////////////////////////////////////////////////
//   Pulsar Engine Main File                                                 //
//                                                                           //
//   This file serves as the entrypoint for all things Pulsar Engine it is   //
//   responsible for starting the engine's backend and frontend code as well //
//   as fetching important important data from the configs.                  //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

use std::intrinsics::mir::Return;
use std::{collections::HashMap, path::Component};
use std::any::Any;
use std::default::Default;
use std::fmt::Debug;
use std::iter::Map;
use thiserror::*;
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
#[derive(Debug, Clone, PartialEq, Eq,thiserror::Error)]
enum Error {
    #[error("Invalid name: {0}")]
    InvalidName(String),
    #[error("Component with name {0} already exists")]
    NameTaken(String),
    #[error("Failed to create component: {0}")]
    CreationFailed(String)
}
#[derive(Debug)]
pub struct BaseComponent {
    name: String,
    status: ComponentStatus
}
struct Event<Type> { // Generic
    name: String,
    data: Type,
}

// struct Dispatcher {
//     events:Vec<Event<dyn Any>>
// }
#[derive(Debug)]
enum ComponentStatus {
    Active, // Captures propogated events
    Inactive, // Captures propgated events but does not interact
    Disabled, // Does not capture events
}

#[derive(Debug)]
pub struct Object {
    pub name: String,
    pub components: HashMap<usize, Box<dyn Component>>
}

pub trait Component: Debug {
    fn name(&self) -> &str;
    fn status(&self) -> ComponentStatus;
    fn set_status(&mut self, status: ComponentStatus);
    fn ready(&mut self) {}
    fn process(&mut self) {}
 }

impl Object {
    /// Creates a new `Object` instance with the given name.
    ///
    /// # Arguments
    ///
    /// * `name` - A string slice that represents the name of the object.
    ///
    /// # Returns
    ///
    /// Returns a `Result` containing the new `Object` if the name is valid.
    /// Returns an `Err` variant with `ObjectError::InvalidName` if the name is empty.
    ///
    /// # Errors
    ///
    /// This function will return an error if:
    /// - The provided `name` is an empty string.
    ///
    /// # Example
    ///
    /// ```
    /// let obj = Object::new("MyObject");
    /// match obj {
    ///     Ok(object) => println!("Object created successfully: {}", object.name),
    ///     Err(e) => println!("Failed to create object: {}", e),
    /// }
    /// ```
    pub fn new(name : impl Into<String>) -> Self {
        Self {
            name: name.into(),
            components: components::HashMap::new(),
        }
    }

    /// Adds a component to an object by ref.
    /// 
    /// # Arguments
    /// 
    /// * `new_component` - A ref to the component to be added
    ///
    /// # Returns
    ///
    /// Returns a `Result` containing the new `Object` if the component is valid.
    /// Returns an `Err` variant with `ObjectError::InvalidName` if the component field is empty.
    /// 
    /// &dyn 
    /// 
    /// 
    pub fn add_component<T: Component + 'static>(&mut self,name : impl Into<String>) {
        let component = T::new(name);
        self.components.insert(component.name().to_string(), Box::new(component));
    }

impl BaseComponent {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            status: ComponentStatus::Active
        }
    }
}

impl Component for BaseComponent {
    fn ready(&mut self) {
        // Implementation pending
        println!("{} is ready!",self.name())
    }

    fn process(&mut self) {
        // Implementation pending
    }


    fn name(&self) -> &str {
        todo!()
    }
    
    fn status(&self) -> ComponentStatus {
        self.status
    }
    
    fn set_status(&mut self, status: ComponentStatus) {
        todo!()
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

struct MyComponent {
    name: String,
    status: ComponentStatus
}

impl Component for MyComponent {}

fn main() -> Result<(), Error> {
    ez_logging::init();
    println!("Hello, world!");

    // Create in anstance of the custom component class
    let my_char_movement = MyComponent::new("Character Movement");

    // Create a instance of the object class and add the component instance to it
    let player_1 = Object::new("Character");
    player_1::add_component(my_char_movement);

    Ok(())
    }
}